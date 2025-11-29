import Contact from '../models/Contact.js';

export async function listContacts(filter = {}) {
  const query = { archived: false };
  
  // Filtre par profil
  if (filter.profile) {
    query.profile = filter.profile;
  }
  
  // Recherche textuelle
  if (filter.search) {
    query.$or = [
      { firstName: new RegExp(filter.search, 'i') },
      { lastName: new RegExp(filter.search, 'i') },
      { company: new RegExp(filter.search, 'i') },
      { email: new RegExp(filter.search, 'i') }
    ];
  }
  
  return Contact.find(query).sort({ lastName: 1, firstName: 1 });
}

export async function getContactById(id) {
  return Contact.findById(id);
}

export async function createContact(data) {
  // Générer une couleur si non fournie
  if (!data.colorTag) {
    const name = `${data.firstName} ${data.lastName}`;
    data.colorTag = generateColorFromName(name);
  }
  
  return Contact.create(data);
}

export async function updateContact(id, data) {
  return Contact.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteContact(id) {
  await Contact.findByIdAndDelete(id);
  return { ok: true };
}

export async function archiveContact(id, archived = true) {
  return Contact.findByIdAndUpdate(id, { archived }, { new: true });
}

export async function searchContacts(searchTerm) {
  return Contact.find({
    $text: { $search: searchTerm },
    archived: false
  }).limit(20);
}

export async function getContactsByProfile(profile) {
  return Contact.find({ profile, archived: false }).sort({ lastName: 1 });
}

export async function getContactStats() {
  const total = await Contact.countDocuments({ archived: false });
  const byProfile = await Contact.aggregate([
    { $match: { archived: false } },
    { $group: { _id: '$profile', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return { total, byProfile };
}

// Fonction utilitaire pour générer une couleur
function generateColorFromName(name) {
  if (!name) return '#64748B';
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#A855F7'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
