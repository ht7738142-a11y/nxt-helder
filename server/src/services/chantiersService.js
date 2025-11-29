import Chantier from '../models/Chantier.js';

export async function listChantiers(filter = {}) {
  return Chantier.find(filter).populate('client').populate('manager').sort({ createdAt: -1 });
}

export async function getChantierById(id) {
  return Chantier.findById(id).populate('client').populate('manager').populate('pointages.user').populate('dailyReports.author');
}

export async function createChantier(data) {
  return Chantier.create(data);
}

export async function updateChantier(id, data) {
  return Chantier.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteChantier(id) {
  await Chantier.findByIdAndDelete(id);
  return { ok: true };
}

export async function addPointage(id, data) {
  const ch = await Chantier.findById(id);
  if (!ch) return null;
  ch.pointages.push(data);
  await ch.save();
  return ch;
}

export async function addIncident(id, data) {
  const ch = await Chantier.findById(id);
  if (!ch) return null;
  ch.incidents.push(data);
  await ch.save();
  return ch;
}

export async function addDailyReport(id, data) {
  const ch = await Chantier.findById(id);
  if (!ch) return null;
  ch.dailyReports.push(data);
  await ch.save();
  return ch;
}

export async function addFiles(id, files) {
  const ch = await Chantier.findById(id);
  if (!ch) return null;
  ch.files.push(...files);
  await ch.save();
  return ch;
}

export async function getKPIs(id) {
  const ch = await Chantier.findById(id).populate('pointages.user');
  if (!ch) return null;
  const totalHours = ch.pointages.reduce((sum, p) => sum + (p.hours || 0), 0);
  const costPerHour = totalHours > 0 ? ch.costActual / totalHours : 0;
  const marginRate = ch.costEstimate > 0 ? ((ch.costEstimate - ch.costActual) / ch.costEstimate) : 0;
  const daysDelay = ch.endDate && new Date() > ch.endDate ? Math.ceil((new Date() - ch.endDate) / 86400000) : 0;
  return { totalHours, costPerHour, marginRate, daysDelay, progress: ch.progress };
}

export async function getStats() {
  const [total, byStatus] = await Promise.all([
    Chantier.countDocuments(),
    Chantier.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalCost: { $sum: '$costActual' } } }])
  ]);
  return { total, byStatus };
}

export async function consumeStock(chantierId, materielId, quantity) {
  const Materiel = (await import('../models/Materiel.js')).default;
  const mat = await Materiel.findById(materielId);
  if (!mat) return null;
  mat.quantity -= Number(quantity || 0);
  await mat.save();
  return mat;
}

export async function close(id) {
  return Chantier.findByIdAndUpdate(id, { status: 'completed', progress: 100 }, { new: true });
}
