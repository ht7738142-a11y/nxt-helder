import Joi from 'joi';
import * as service from '../services/assignmentsService.js';
import { log as auditLog } from '../lib/audit.js';

export const schemas = {
  create: Joi.object({
    chantier: Joi.string().hex().length(24).required(),
    startDatetime: Joi.date().iso().required(),
    endDatetime: Joi.date().iso().greater(Joi.ref('startDatetime')).required(),
    assignedContacts: Joi.array().items(Joi.string().hex().length(24)).optional(),
    colorTag: Joi.string().optional(),
    note: Joi.string().optional().allow(''),
    status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled').optional()
  }),
  updateParams: Joi.object({ 
    id: Joi.string().hex().length(24).required() 
  }),
  updateBody: Joi.object({
    chantier: Joi.string().hex().length(24).optional(),
    startDatetime: Joi.date().iso().optional(),
    endDatetime: Joi.date().iso().optional(),
    assignedContacts: Joi.array().items(Joi.string().hex().length(24)).optional(),
    colorTag: Joi.string().optional(),
    note: Joi.string().optional().allow(''),
    status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled').optional()
  }).min(1),
  addContact: Joi.object({
    contactId: Joi.string().hex().length(24).required()
  })
};

export async function list(req, res) {
  try {
    const filter = {
      start: req.query.start,
      end: req.query.end,
      chantier: req.query.chantier,
      contact: req.query.contact,
      status: req.query.status
    };
    
    const items = await service.listAssignments(filter);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getOne(req, res) {
  try {
    const item = await service.getAssignmentById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Assignment non trouvé' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const item = await service.createAssignment(req.body, req.user?.id);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'create', 
      collection: 'Assignment', 
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
    const before = await service.getAssignmentById(req.params.id);
    const item = await service.updateAssignment(req.params.id, req.body);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'update', 
      collection: 'Assignment', 
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
    const before = await service.getAssignmentById(req.params.id);
    const out = await service.deleteAssignment(req.params.id);
    await auditLog({ 
      userId: req.user?.id, 
      action: 'delete', 
      collection: 'Assignment', 
      documentId: req.params.id, 
      before, 
      after: null 
    });
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function addContact(req, res) {
  try {
    const item = await service.addContactToAssignment(req.params.id, req.body.contactId);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function removeContact(req, res) {
  try {
    const item = await service.removeContactFromAssignment(req.params.id, req.params.contactId);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function checkConflicts(req, res) {
  try {
    const { contactId, startDatetime, endDatetime, excludeId } = req.query;
    const conflicts = await service.checkConflicts(contactId, startDatetime, endDatetime, excludeId);
    res.json({ conflicts, hasConflicts: conflicts.length > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function stats(req, res) {
  try {
    const { start, end } = req.query;
    const data = await service.getAssignmentStats(start, end);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
