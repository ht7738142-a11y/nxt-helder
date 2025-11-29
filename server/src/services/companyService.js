import Company from '../models/Company.js';

// Point 121-125: Gestion multi-sociétés

export async function listCompanies(filter = {}) {
  return Company.find(filter).sort({ name: 1 });
}

export async function getCompanyById(id) {
  return Company.findById(id);
}

export async function createCompany(data) {
  return Company.create(data);
}

export async function updateCompany(id, data) {
  return Company.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteCompany(id) {
  await Company.findByIdAndUpdate(id, { active: false });
  return { ok: true };
}

// Point 122: Isolation données par société
export function addCompanyFilter(userId, companyId) {
  // Middleware pour ajouter automatiquement le filtre company aux queries
  return { company: companyId };
}

// Point 123: Switch société pour utilisateurs multi-sociétés
export async function switchCompany(userId, newCompanyId) {
  // Vérifier droits utilisateur sur cette société
  const company = await Company.findById(newCompanyId);
  if (!company || !company.active) return null;
  
  // TODO: Vérifier que user appartient à cette company
  // Mettre à jour session/token avec nouvelle company
  
  return company;
}

// Point 124: Paramètres société
export async function updateSettings(companyId, settings) {
  return Company.findByIdAndUpdate(
    companyId,
    { $set: { settings } },
    { new: true }
  );
}

// Point 125: Branding personnalisé
export async function updateBranding(companyId, branding) {
  return Company.findByIdAndUpdate(
    companyId,
    { $set: { branding } },
    { new: true }
  );
}
