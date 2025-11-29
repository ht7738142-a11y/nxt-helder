import Joi from 'joi'
import * as service from '../services/clientsService.js'
import { log as auditLog } from '../lib/audit.js'

export const schemas = {
  create: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    company: Joi.string().optional(),
    vat: Joi.string().optional(),
    profil: Joi.string().optional()
  }),
  updateParams: Joi.object({ id: Joi.string().hex().length(24).required() }),
  updateBody: Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    company: Joi.string().optional(),
    vat: Joi.string().optional(),
    profil: Joi.string().optional()
  }).min(1)
}

export async function list(req, res){
  const items = await service.listClients()
  res.json(items)
}

export async function getOne(req, res){
  const item = await service.getClientById(req.params.id)
  if (!item) return res.status(404).json({ error: 'Client not found' })
  res.json(item)
}

export async function create(req, res){
  const item = await service.createClient(req.body)
  await auditLog({ userId: req.user?.id, action: 'create', collection: 'Client', documentId: item.id, before: null, after: item })
  res.json(item)
}

export async function update(req, res){
  const before = (await service.listClients()).find(c=>String(c._id)===req.params.id) || null
  const item = await service.updateClient(req.params.id, req.body)
  await auditLog({ userId: req.user?.id, action: 'update', collection: 'Client', documentId: req.params.id, before, after: item })
  res.json(item)
}

export async function remove(req, res){
  const before = (await service.listClients()).find(c=>String(c._id)===req.params.id) || null
  const out = await service.deleteClient(req.params.id)
  await auditLog({ userId: req.user?.id, action: 'delete', collection: 'Client', documentId: req.params.id, before, after: null })
  res.json(out)
}
