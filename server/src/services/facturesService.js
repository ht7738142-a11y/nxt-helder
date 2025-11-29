import Facture from '../models/Facture.js';
import Devis from '../models/Devis.js';

function computeFromDevis(devis) {
  const subtotal = Number(devis?.totals?.subtotal || 0);
  const taxRate = Number(devis?.totals?.taxRate || 0.21);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;
  return { subtotal, taxRate, tax, grandTotal };
}

export async function listFactures() {
  return Facture.find()
    .populate('client')
    .populate({ path: 'devis', populate: ['client', 'author'] })
    .sort({ createdAt: -1 });
}

export async function createFacture(devisId, number, advance = 0) {
  const devis = await Devis.findById(devisId).populate('client');
  if (!devis) return null;
  const totals = computeFromDevis(devis);
  const fac = await Facture.create({
    number,
    devis: devis._id,
    client: devis.client._id,
    totals,
    advance,
    currency: devis.currency,
  });
  return Facture.findById(fac._id).populate('client').populate('devis');
}

export async function addPayment(id, amount) {
  const fac = await Facture.findById(id);
  if (!fac) return null;
  fac.payments.push({ amount: Number(amount || 0) });
  const paid = fac.payments.reduce((a, b) => a + Number(b.amount || 0), 0);
  fac.status = paid >= fac.totals.grandTotal ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  await fac.save();
  return fac;
}

export async function getFactureById(id) {
  return Facture.findById(id)
    .populate({ path: 'devis', populate: ['client', 'author'] })
    .populate('client');
}

export async function exportCompta(format, start, end) {
  const filter = {};
  if (start) filter.createdAt = { $gte: new Date(start) };
  if (end) filter.createdAt = { ...filter.createdAt, $lte: new Date(end) };
  const factures = await Facture.find(filter).populate('client');
  const rows = factures.map(f => ({
    number: f.number || f._id,
    date: f.createdAt?.toISOString().split('T')[0],
    client: f.client?.name || '',
    subtotal: f.totals?.subtotal || 0,
    tax: f.totals?.tax || 0,
    total: f.totals?.grandTotal || 0,
    status: f.status,
  }));
  return rows;
}

export async function getTVAJournal(start, end) {
  const filter = {};
  if (start) filter.createdAt = { $gte: new Date(start) };
  if (end) filter.createdAt = { ...filter.createdAt, $lte: new Date(end) };
  const factures = await Facture.find(filter);
  const byRate = {};
  factures.forEach(f => {
    const rate = f.totals?.taxRate || 0.21;
    if (!byRate[rate]) byRate[rate] = { rate, subtotal: 0, tax: 0, total: 0, count: 0 };
    byRate[rate].subtotal += f.totals?.subtotal || 0;
    byRate[rate].tax += f.totals?.tax || 0;
    byRate[rate].total += f.totals?.grandTotal || 0;
    byRate[rate].count++;
  });
  return Object.values(byRate);
}
