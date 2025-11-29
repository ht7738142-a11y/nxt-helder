import Joi from 'joi';
import * as service from '../services/devisService.js';
import { generateDevisPDF } from '../utils/pdf.js';
import { sendDevisEmail } from '../utils/mail.js';
import { log as auditLog } from '../lib/audit.js';
import DevisVersion from '../models/DevisVersion.js';
import path from 'path';

export const schemas = {
  create: Joi.object({
    title: Joi.string().required(),
    client: Joi.string().hex().length(24).required(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          quantity: Joi.number().min(0).required(),
          unit: Joi.string().default('unit'),
          unitPrice: Joi.number().min(0).required(),
        })
      )
      .default([]),
    currency: Joi.string().default('EUR'),
    notes: Joi.string().allow('').optional(),
    marginRate: Joi.number().min(0).default(0),
    totals: Joi.object({
      taxRate: Joi.number().min(0).max(1).default(0.21),
    }).optional(),
  }),
  update: Joi.object({
    title: Joi.string().optional(),
    client: Joi.string().hex().length(24).optional(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          quantity: Joi.number().min(0).required(),
          unit: Joi.string().default('unit'),
          unitPrice: Joi.number().min(0).required(),
        })
      )
      .optional(),
    currency: Joi.string().optional(),
    notes: Joi.string().allow('').optional(),
    marginRate: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid('draft', 'sent', 'approved', 'rejected', 'invoiced')
      .optional(),
    totals: Joi.object({
      taxRate: Joi.number().min(0).max(1).optional(),
    }).optional(),
    versionNote: Joi.string().allow('').optional(),
  }).min(1),
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() }),
  statusBody: Joi.object({
    status: Joi.string().valid('draft', 'sent', 'approved', 'rejected', 'invoiced').required(),
  }),
  toFactureBody: Joi.object({
    number: Joi.string().optional(),
  }),
  signBody: Joi.object({
    by: Joi.string().min(2).required(),
    imageData: Joi.string().allow('').optional(),
  })
};

export async function list(req, res) {
  const { q, status, client, page, limit } = req.query || {};
  const out = await service.listDevis({ q, status, client, page, limit });
  res.json(out);
}

export async function sign(req, res) {
  try {
    const before = await service.getDevisById(req.params.id);
    if (!before) return res.status(404).json({ error: 'Not found' });
    const update = { signature: { by: req.body.by, at: new Date(), imageData: req.body.imageData || undefined }, status: 'approved' };
    const devis = await service.updateDevis(req.params.id, update);
    await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before, after: devis, meta: { action: 'sign' } });
    res.json(devis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const devis = await service.createDevis(req.body, req.user.id);
    await auditLog({ userId: req.user?.id, action: 'create', collection: 'Devis', documentId: devis.id, before: null, after: devis });
    try {
      await sendDevisEmail({
        to: process.env.SMTP_USER,
        subject: 'Nouveau devis',
        text: `Devis ${devis.title} créé.`,
      });
    } catch {}
    res.json(devis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const before = await service.getDevisById(req.params.id);
    const devis = await service.updateDevis(req.params.id, req.body);
    await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before, after: devis });
    try {
      await DevisVersion.create({ devis: devis._id, author: req.user?.id || null, data: devis, note: req.body?.versionNote || undefined });
    } catch {}
    try {
      await sendDevisEmail({
        to: process.env.SMTP_USER,
        subject: 'Devis mis à jour',
        text: `Devis ${devis.title} mis à jour.`,
      });
    } catch {}
    res.json(devis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const before = await service.getDevisById(req.params.id);
    const devis = await service.updateDevisStatus(req.params.id, req.body.status);
    await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before, after: devis, meta: { field: 'status' } });
    res.json(devis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function duplicate(req, res) {
  try {
    const copy = await service.duplicateDevis(req.params.id, req.user.id);
    if (!copy) return res.status(404).json({ error: 'Not found' });
    await auditLog({ userId: req.user?.id, action: 'create', collection: 'Devis', documentId: copy.id, before: null, after: copy, meta: { duplicatedFrom: req.params.id } });
    res.json(copy);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function toFacture(req, res) {
  try {
    const fac = await service.transformToFacture(req.params.id, req.body?.number);
    if (!fac) return res.status(404).json({ error: 'Not found' });
    await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before: null, after: { status: 'invoiced' }, meta: { toFacture: fac.id } });
    res.json(fac);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getPDF(req, res) {
  try {
    const devis = await service.getDevisById(req.params.id);
    if (!devis) return res.status(404).json({ error: 'Not found' });
    generateDevisPDF(devis, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function versions(req, res) {
  try {
    const items = await DevisVersion.find({ devis: req.params.id }).populate('author', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function archive(req, res) {
  const before = await service.getDevisById(req.params.id);
  const item = await service.setArchived(req.params.id, true);
  await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before, after: item, meta: { field: 'archived', value: true } });
  res.json(item);
}

export async function unarchive(req, res) {
  const before = await service.getDevisById(req.params.id);
  const item = await service.setArchived(req.params.id, false);
  await auditLog({ userId: req.user?.id, action: 'update', collection: 'Devis', documentId: req.params.id, before, after: item, meta: { field: 'archived', value: false } });
  res.json(item);
}

export async function addFiles(req, res) {
  const mapped = (req.files || []).map((f) => ({ name: f.originalname, path: `/uploads/${path.basename(f.path)}`, type: f.mimetype, size: f.size }));
  const item = await service.addFiles(req.params.id, mapped);
  res.json(item);
}

export async function removeFile(req, res) {
  const item = await service.removeFileByIndex(req.params.id, req.params.index);
  res.json(item || { ok: false });
}

export async function stats(_req, res) {
  const data = await service.getStats();
  res.json(data);
}
