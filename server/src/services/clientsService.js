import Client from '../models/Client.js'

export async function listClients() {
  return Client.find().sort({ createdAt: -1 })
}

export async function getClientById(id) {
  return Client.findById(id)
}

export async function createClient(data) {
  return Client.create(data)
}

export async function updateClient(id, data) {
  return Client.findByIdAndUpdate(id, data, { new: true })
}

export async function deleteClient(id) {
  await Client.findByIdAndDelete(id)
  return { ok: true }
}

export async function importCSV(rows) {
  const results = { created: 0, errors: [] };
  for (const row of rows) {
    try {
      await Client.create({ name: row.name, email: row.email, phone: row.phone, company: row.company, vat: row.vat, address: row.address, segment: row.segment || 'particulier' });
      results.created++;
    } catch (e) {
      results.errors.push({ row, error: e.message });
    }
  }
  return results;
}

export async function exportCSV() {
  const clients = await Client.find().select('name company email phone vat segment createdAt');
  return clients.map(c => ({ name: c.name, company: c.company || '', email: c.email || '', phone: c.phone || '', vat: c.vat || '', segment: c.segment, createdAt: c.createdAt?.toISOString() || '' }));
}

export async function getCA(id) {
  const Facture = (await import('../models/Facture.js')).default;
  const factures = await Facture.find({ client: id, status: { $in: ['paid', 'partial'] } });
  return factures.reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
}

export async function getStats() {
  const [total, bySegment] = await Promise.all([
    Client.countDocuments(),
    Client.aggregate([{ $group: { _id: '$segment', count: { $sum: 1 } } }])
  ]);
  return { total, bySegment };
}

export async function mergeClients(sourceId, targetId) {
  const [source, target] = await Promise.all([Client.findById(sourceId), Client.findById(targetId)]);
  if (!source || !target) return null;
  target.contacts.push(...(source.contacts || []));
  target.addresses.push(...(source.addresses || []));
  target.documents.push(...(source.documents || []));
  target.history.devis.push(...(source.history?.devis || []));
  target.history.factures.push(...(source.history?.factures || []));
  target.history.interactions.push(...(source.history?.interactions || []));
  await target.save();
  await Client.findByIdAndDelete(sourceId);
  return target;
}

export async function addInteraction(id, data) {
  const c = await Client.findById(id);
  if (!c) return null;
  c.history.interactions.push(data);
  await c.save();
  return c;
}

export async function setArchived(id, archived) {
  return Client.findByIdAndUpdate(id, { archived: !!archived }, { new: true });
}
