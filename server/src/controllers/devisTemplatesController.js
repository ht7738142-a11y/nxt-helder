import Joi from 'joi';
import * as service from '../services/devisTemplatesService.js';
import { validate } from '../middleware/validate.js';

export const schemas = {
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() }),
  create: Joi.object({
    name: Joi.string().min(2).required(),
    title: Joi.string().min(2).required(),
    items: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().min(0).default(1),
      unit: Joi.string().default('u'),
      unitPrice: Joi.number().min(0).default(0),
    })).default([]),
    currency: Joi.string().default('EUR'),
    notes: Joi.string().allow('').optional(),
    marginRate: Joi.number().min(0).default(0),
    defaultTaxRate: Joi.number().min(0).max(1).default(0.21),
  }),
  update: Joi.object({
    name: Joi.string().min(2).optional(),
    title: Joi.string().min(2).optional(),
    items: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().min(0).default(1),
      unit: Joi.string().default('u'),
      unitPrice: Joi.number().min(0).default(0),
    })).optional(),
    currency: Joi.string().optional(),
    notes: Joi.string().allow('').optional(),
    marginRate: Joi.number().min(0).optional(),
    defaultTaxRate: Joi.number().min(0).max(1).optional(),
  }).min(1)
};

export async function list(_req, res) {
  res.json(await service.listTemplates());
}

export async function get(req, res) {
  const t = await service.getTemplate(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
}

export async function create(req, res) {
  try {
    const t = await service.createTemplate(req.body);
    res.status(201).json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  const t = await service.updateTemplate(req.params.id, req.body);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
}

export async function remove(req, res) {
  await service.deleteTemplate(req.params.id);
  res.json({ ok: true });
}
