import DevisTemplate from '../models/DevisTemplate.js';

export async function listTemplates() {
  return DevisTemplate.find().sort({ createdAt: -1 });
}

export async function getTemplate(id) {
  return DevisTemplate.findById(id);
}

export async function createTemplate(data) {
  return DevisTemplate.create(data);
}

export async function updateTemplate(id, data) {
  return DevisTemplate.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteTemplate(id) {
  await DevisTemplate.findByIdAndDelete(id);
  return { ok: true };
}
