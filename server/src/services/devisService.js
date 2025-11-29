import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import { toMeters } from '../utils/units.js';
import DevisTemplate from '../models/DevisTemplate.js';

function computeTotals(d) {
  let subtotal = 0;
  d.items = (d.items || []).map(it => ({
    ...it,
    // normalize quantities for linear units (cm/mm->m) for pricing if unit suggests length
    quantity: (() => {
      const u = (it.unit || '').toLowerCase();
      if (['m','cm','mm'].includes(u)) return toMeters(it.quantity, u);
      return Number(it.quantity || 0);
    })(),
    total: (() => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.unitPrice || 0);
      return qty * price;
    })()
  }));
  subtotal = d.items.reduce((a, b) => a + (Number(b.total) || 0), 0);
  const marginRate = Number(d.marginRate || 0);
  const marginAmount = subtotal * marginRate;
  const subtotalWithMargin = subtotal + marginAmount;
  const tax = subtotal * (Number(d.totals?.taxRate ?? 0.21));
  const grandTotal = subtotal + tax;
  d.totals = { subtotal, subtotalWithMargin, marginAmount, taxRate: Number(d.totals?.taxRate ?? 0.21), tax, grandTotal };
  return d;
}

function validateBusinessRules(d) {
  // items: qty>=0, unitPrice>=0, description required
  for (const it of d.items || []) {
    if (Number(it.quantity) < 0) throw new Error('La quantité ne peut pas être négative');
    if (Number(it.unitPrice) < 0) throw new Error('Le prix unitaire ne peut pas être négatif');
    if (!it.description) throw new Error('La désignation est requise');
  }
  // totals
  const taxRate = Number(d.totals?.taxRate ?? 0.21);
  if (!(taxRate >= 0 && taxRate <= 1)) throw new Error('Le taux de TVA doit être entre 0 et 1');
  // currency
  if (!d.currency) d.currency = 'EUR';
}

export async function listDevis({ q, status, client, page = 1, limit = 50 } = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (client) filter.client = client;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { notes: { $regex: q, $options: 'i' } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Devis.find(filter)
      .populate('client')
      .populate('author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Devis.countDocuments(filter),
  ]);
  return { items, page: Number(page), limit: Number(limit), total };
}

export async function createDevis(data, authorId) {
  // If a template is provided, merge defaults
  if (data.templateId) {
    const t = await DevisTemplate.findById(data.templateId);
    if (t) {
      data.title = data.title || t.title;
      data.items = (data.items && data.items.length ? data.items : t.items) || [];
      data.currency = data.currency || t.currency;
      data.notes = data.notes || t.notes;
      data.marginRate = typeof data.marginRate === 'number' ? data.marginRate : t.marginRate;
      data.totals = { taxRate: (data.totals?.taxRate ?? t.defaultTaxRate ?? 0.21) };
    }
  }
  validateBusinessRules(data);
  const body = computeTotals(data);
  const devis = await Devis.create({ ...body, author: authorId });
  return Devis.findById(devis._id).populate('client').populate('author');
}

export async function updateDevis(id, data) {
  validateBusinessRules(data);
  const body = computeTotals(data);
  return Devis.findByIdAndUpdate(id, body, { new: true }).populate('client').populate('author');
}

export async function updateDevisStatus(id, status) {
  const doc = await Devis.findById(id);
  if (!doc) return null;
  const from = doc.status;
  const allowed = new Set([
    'draft:draft','draft:sent','draft:approved','draft:rejected',
    'sent:approved','sent:rejected',
    'approved:invoiced',
  ]);
  const key = `${from}:${status}`;
  if (!allowed.has(key)) throw new Error(`Transition de statut interdite: ${from} -> ${status}`);
  doc.status = status;
  await doc.save();
  return doc;
}

export async function duplicateDevis(id, authorId) {
  const original = await Devis.findById(id);
  if (!original) return null;
  const copy = await Devis.create({
    title: original.title + ' (copie)',
    client: original.client,
    author: authorId,
    items: original.items,
    currency: original.currency,
    notes: original.notes,
    totals: original.totals,
    status: 'draft',
    marginRate: original.marginRate || 0
  });
  return copy;
}

export async function transformToFacture(id, number) {
  const devis = await Devis.findById(id).populate('client');
  if (!devis) return null;
  const subtotal = Number(devis?.totals?.subtotal || 0);
  const taxRate = Number(devis?.totals?.taxRate || 0.21);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;
  const fac = await Facture.create({
    number,
    devis: devis._id,
    client: devis.client._id,
    totals: { subtotal, taxRate, tax, grandTotal },
    currency: devis.currency
  });
  await Devis.findByIdAndUpdate(devis._id, { status: 'invoiced' });
  return fac;
}

export async function getDevisById(id) {
  return Devis.findById(id).populate('client').populate('author');
}

export async function setArchived(id, archived) {
  return Devis.findByIdAndUpdate(id, { archived: !!archived }, { new: true });
}

export async function addFiles(id, files) {
  const doc = await Devis.findById(id);
  if (!doc) return null;
  doc.files.push(...files);
  await doc.save();
  return doc;
}

export async function removeFileByIndex(id, index) {
  const doc = await Devis.findById(id);
  if (!doc) return null;
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= doc.files.length) return null;
  doc.files.splice(i, 1);
  await doc.save();
  return doc;
}

export async function getStats() {
  const pipeline = [
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totals.grandTotal' } } }
  ];
  const byStatus = await Devis.aggregate(pipeline);
  const totalAmount = byStatus.reduce((a, b) => a + (b.total || 0), 0);
  return { byStatus, totalAmount };
}
