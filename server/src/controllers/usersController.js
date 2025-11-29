import Joi from 'joi';
import * as service from '../services/usersService.js';
import { log as auditLog } from '../lib/audit.js';

export const schemas = {
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() }),
  create: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid('admin', 'direction', 'chefChantier', 'comptable', 'commercial', 'ouvrier')
      .required(),
  }),
  update: Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional(),
    role: Joi.string().valid('admin', 'direction', 'chefChantier', 'comptable', 'commercial', 'ouvrier').optional(),
    twoFactorEnabled: Joi.boolean().optional(),
  }).min(1),
};

export async function list(_req, res) {
  const users = await service.listUsers();
  res.json(users);
}

export async function get(req, res) {
  const user = await service.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
}

export async function create(req, res) {
  try {
    const user = await service.createUser(req.body);
    await auditLog({
      userId: req.user?.id,
      action: 'create',
      collection: 'User',
      documentId: user.id,
      before: null,
      after: user,
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const before = await service.getUserById(req.params.id);
    const user = await service.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await auditLog({
      userId: req.user?.id,
      action: 'update',
      collection: 'User',
      documentId: req.params.id,
      before,
      after: user,
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  const before = await service.getUserById(req.params.id);
  const user = await service.deleteUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  await auditLog({
    userId: req.user?.id,
    action: 'delete',
    collection: 'User',
    documentId: req.params.id,
    before,
    after: null,
  });
  res.json(user);
}
