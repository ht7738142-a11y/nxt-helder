import Joi from 'joi';
import * as service from '../services/facturesService.js';
import { generateFacturePDF } from '../utils/pdf.js';
import { sendDevisEmail as sendEmail } from '../utils/mail.js';
import { log as auditLog } from '../lib/audit.js';

export const schemas = {
  create: Joi.object({
    devisId: Joi.string().hex().length(24).required(),
    number: Joi.string().optional(),
    advance: Joi.number().min(0).default(0),
  }),
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() }),
  paymentBody: Joi.object({
    amount: Joi.number().min(0).required(),
  }),
};

export async function list(req, res) {
  const items = await service.listFactures();
  res.json(items);
}

export async function create(req, res) {
  try {
    const { devisId, number, advance } = req.body;
    const fac = await service.createFacture(devisId, number, advance);
    if (!fac) return res.status(404).json({ error: 'Devis non trouvé' });
    await auditLog({ userId: req.user?.id, action: 'create', collection: 'Facture', documentId: fac.id, before: null, after: fac, meta: { fromDevis: devisId } });
    try {
      await sendEmail({
        to: process.env.SMTP_USER,
        subject: 'Facture créée',
        text: `Facture ${number || fac._id} créée.`,
      });
    } catch {}
    res.json(fac);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function pay(req, res) {
  try {
    const { amount } = req.body;
    const before = await service.getFactureById(req.params.id);
    const fac = await service.addPayment(req.params.id, amount);
    if (!fac) return res.status(404).json({ error: 'Not found' });
    await auditLog({ userId: req.user?.id, action: 'update', collection: 'Facture', documentId: req.params.id, before, after: fac, meta: { action: 'addPayment', amount } });
    res.json(fac);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getPDF(req, res) {
  try {
    const fac = await service.getFactureById(req.params.id);
    if (!fac) return res.status(404).json({ error: 'Not found' });
    generateFacturePDF(fac, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
