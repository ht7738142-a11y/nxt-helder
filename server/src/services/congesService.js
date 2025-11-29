import Conge from '../models/Conge.js';

export async function listConges(filter = {}) {
  return Conge.find(filter).populate('user', 'name email role').populate('approvedBy', 'name').sort({ startDate: -1 });
}

export async function getCongeById(id) {
  return Conge.findById(id).populate('user').populate('approvedBy');
}

export async function createConge(data) {
  return Conge.create(data);
}

export async function updateConge(id, data) {
  return Conge.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteConge(id) {
  await Conge.findByIdAndDelete(id);
  return { ok: true };
}

export async function approveConge(id, approverId) {
  return Conge.findByIdAndUpdate(id, { status: 'approved', approvedBy: approverId }, { new: true });
}

export async function rejectConge(id, approverId) {
  return Conge.findByIdAndUpdate(id, { status: 'rejected', approvedBy: approverId }, { new: true });
}
