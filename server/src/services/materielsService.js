import Materiel from '../models/Materiel.js';

export async function listMateriels() {
  return Materiel.find().sort({ name: 1 });
}

export async function getMaterielById(id) {
  return Materiel.findById(id);
}

export async function createMateriel(data) {
  return Materiel.create(data);
}

export async function updateMateriel(id, data) {
  return Materiel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteMateriel(id) {
  await Materiel.findByIdAndDelete(id);
  return { ok: true };
}

export async function moveStock(id, quantity, type, reason, chantier) {
  const mat = await Materiel.findById(id);
  if (!mat) return null;
  const delta = type === 'in' ? Number(quantity) : -Number(quantity);
  mat.quantity += delta;
  await mat.save();
  // Log mouvement (optionnel: créer modèle StockMovement pour traçabilité)
  return mat;
}

export async function getLowStock() {
  return Materiel.find({ $expr: { $lt: ['$quantity', '$lowStockThreshold'] } });
}

export async function getValuation() {
  const items = await Materiel.find();
  const total = items.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
  return { total, items: items.length };
}
