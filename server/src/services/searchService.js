import Client from '../models/Client.js';
import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';

// Point 107: Recherche unifiée cross-collection
export async function unifiedSearch(query, options = {}) {
  const { limit = 20, types = ['clients', 'devis', 'factures', 'chantiers'] } = options;
  
  const regex = new RegExp(query, 'i');
  const results = {};
  
  if (types.includes('clients')) {
    results.clients = await Client.find({ 
      $or: [{ name: regex }, { company: regex }, { email: regex }] 
    }).limit(limit).select('name company email');
  }
  
  if (types.includes('devis')) {
    results.devis = await Devis.find({ 
      $or: [{ title: regex }, { number: regex }] 
    }).limit(limit).populate('client', 'name').select('title number status client');
  }
  
  if (types.includes('factures')) {
    results.factures = await Facture.find({ 
      $or: [{ number: regex }] 
    }).limit(limit).populate('client', 'name').select('number status client');
  }
  
  if (types.includes('chantiers')) {
    results.chantiers = await Chantier.find({ 
      $or: [{ title: regex }, { address: regex }] 
    }).limit(limit).populate('client', 'name').select('title status client');
  }
  
  return results;
}

// Point 108: Filtres avancés avec combinaisons
export async function advancedFilter(collection, filters) {
  const query = {};
  
  // Date ranges
  if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
  
  // Status
  if (filters.status) query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
  
  // Montants
  if (filters.minAmount) query['totals.grandTotal'] = { $gte: Number(filters.minAmount) };
  if (filters.maxAmount) query['totals.grandTotal'] = { ...query['totals.grandTotal'], $lte: Number(filters.maxAmount) };
  
  // Client
  if (filters.client) query.client = filters.client;
  
  // Text search
  if (filters.q) query.$or = [
    { title: new RegExp(filters.q, 'i') },
    { number: new RegExp(filters.q, 'i') }
  ];
  
  const Model = {
    devis: Devis,
    factures: Facture,
    chantiers: Chantier
  }[collection];
  
  if (!Model) return [];
  
  return Model.find(query)
    .populate('client', 'name company')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);
}

// Point 109: Tags & catégories auto
export function autoTag(entity, type) {
  const tags = [];
  
  if (type === 'devis') {
    const total = entity.totals?.grandTotal || 0;
    if (total > 50000) tags.push('gros-projet');
    else if (total > 10000) tags.push('projet-moyen');
    else tags.push('petit-projet');
    
    if (entity.status === 'approved') tags.push('à-facturer');
    if (entity.items?.length > 10) tags.push('complexe');
  }
  
  if (type === 'chantier') {
    if (entity.progress > 80) tags.push('bientôt-terminé');
    if (entity.costActual > entity.costEstimate * 1.1) tags.push('dépassement-budget');
  }
  
  return tags;
}
