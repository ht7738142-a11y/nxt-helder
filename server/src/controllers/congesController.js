import Joi from 'joi';
import * as service from '../services/congesService.js';

export const schemas = {
  create: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    type: Joi.string().valid('conge', 'maladie', 'formation', 'autre').default('conge'),
    reason: Joi.string().allow('').optional(),
  }),
  update: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    type: Joi.string().valid('conge', 'maladie', 'formation', 'autre').optional(),
    reason: Joi.string().allow('').optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  }).min(1),
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export async function list(req, res) {
  const filter = {};
  if (req.query.user) filter.user = req.query.user;
  if (req.query.status) filter.status = req.query.status;
  const items = await service.listConges(filter);
  res.json(items);
}

export async function create(req, res) {
  const conge = await service.createConge({ ...req.body, user: req.user.id });
  res.status(201).json(conge);
}

export async function update(req, res) {
  const conge = await service.updateConge(req.params.id, req.body);
  if (!conge) return res.status(404).json({ error: 'Not found' });
  res.json(conge);
}

export async function remove(req, res) {
  await service.deleteConge(req.params.id);
  res.json({ ok: true });
}

export async function approve(req, res) {
  const conge = await service.approveConge(req.params.id, req.user.id);
  res.json(conge);
}

export async function reject(req, res) {
  const conge = await service.rejectConge(req.params.id, req.user.id);
  res.json(conge);
}
