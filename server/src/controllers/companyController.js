import Joi from 'joi';
import * as service from '../services/companyService.js';

export const schemas = {
  create: Joi.object({
    name: Joi.string().required(),
    legalName: Joi.string().required(),
    vat: Joi.string().required(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      zip: Joi.string(),
      country: Joi.string()
    }),
    contact: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string(),
      website: Joi.string().uri()
    })
  }),
  update: Joi.object({
    name: Joi.string(),
    settings: Joi.object(),
    branding: Joi.object()
  }).min(1),
  idParam: Joi.object({ id: Joi.string().hex().length(24).required() })
};

export async function list(_req, res) {
  const companies = await service.listCompanies();
  res.json(companies);
}

export async function get(req, res) {
  const company = await service.getCompanyById(req.params.id);
  if (!company) return res.status(404).json({ error: 'Not found' });
  res.json(company);
}

export async function create(req, res) {
  const company = await service.createCompany(req.body);
  res.status(201).json(company);
}

export async function update(req, res) {
  const company = await service.updateCompany(req.params.id, req.body);
  if (!company) return res.status(404).json({ error: 'Not found' });
  res.json(company);
}

export async function updateSettings(req, res) {
  const company = await service.updateSettings(req.params.id, req.body);
  res.json(company);
}

export async function updateBranding(req, res) {
  const company = await service.updateBranding(req.params.id, req.body);
  res.json(company);
}
