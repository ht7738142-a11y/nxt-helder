import Joi from 'joi';
import * as service from '../services/contactsService.js';
import { log as auditLog } from '../lib/audit.js';

export const schemas = {
  create: Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    company: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    profile: Joi.string().valid(
      'architecte', 'ingenieur', 'macon', 'charpentier', 'couvreur',
      'electricien', 'plombier', 'peintre', 'menuisier', 'carreleur',
      'platrier', 'chauffagiste', 'chef_chantier', 'conducteur_travaux',
      'bureau_etude', 'geometre', 'jardinier', 'fournisseur',
      'sous_traitant', 'client', 'prospect', 'autre'
    ).optional(),
    colorTag: Joi.string().optional(),
    notes: Joi.string().optional().allow('')
  }),
  updateParams: Joi.object({ 
    id: Joi.string().hex().length(24).required() 
  }),
  updateBody: Joi.object({
    firstName: Joi.string().min(1).optional(),
    lastName: Joi.string().min(1).optional(),
    company: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    profile: Joi.string().valid(
      'architecte', 'ingenieur', 'macon', 'charpentier', 'couvreur',
      'electricien', 'plombier', 'peintre', 'menuisier', 'carreleur',
      'platrier', 'chauffagiste', 'chef_chantier', 'conducteur_travaux',
      'bureau_etude', 'geometre', 'jardinier', 'fournisseur',
      'sous_traitant', 'client', 'prospect', 'autre'
    ).optional(),
    colorTag: Joi.string().optional(),
    notes: Joi.string().optional().allow(''),
    archived: Joi.boolean().optional()
  }).min(1)
};

export async function list(req, res) {
  try {
    const filter = {
      profile: req.query.profile,
      search: req.query.search
    };
    
    const items = await service.listContacts(filter);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getOne(req, res) {
  try {
    const item = await service.getContactById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Contact non trouvé' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const item = await service.createContact(req.body);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'create', 
      collection: 'Contact', 
      documentId: item.id, 
      before: null, 
      after: item 
    });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const before = await service.getContactById(req.params.id);
    const item = await service.updateContact(req.params.id, req.body);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'update', 
      collection: 'Contact', 
      documentId: req.params.id, 
      before, 
      after: item 
    });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    const before = await service.getContactById(req.params.id);
    const out = await service.deleteContact(req.params.id);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'delete', 
      collection: 'Contact', 
      documentId: req.params.id, 
      before, 
      after: null 
    });
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function search(req, res) {
  try {
    const items = await service.searchContacts(req.query.q || '');
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function stats(req, res) {
  try {
    const data = await service.getContactStats();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
