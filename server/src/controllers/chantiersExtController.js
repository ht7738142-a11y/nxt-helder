import * as service from '../services/chantiersService.js';
import { generateChantierPDF } from '../utils/pdf.js';

export async function addPointage(req, res) {
  const result = await service.addPointage(req.params.id, { ...req.body, user: req.body.user || req.user?.id });
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function addIncident(req, res) {
  const result = await service.addIncident(req.params.id, req.body);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function addDailyReport(req, res) {
  const result = await service.addDailyReport(req.params.id, { ...req.body, author: req.user?.id });
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function getKPIs(req, res) {
  const kpis = await service.getKPIs(req.params.id);
  if (!kpis) return res.status(404).json({ error: 'Not found' });
  res.json(kpis);
}

export async function getStats(_req, res) {
  const stats = await service.getStats();
  res.json(stats);
}

export async function getPDF(req, res) {
  const ch = await service.getChantierById(req.params.id);
  if (!ch) return res.status(404).json({ error: 'Not found' });
  generateChantierPDF(ch, res);
}

export async function consumeStock(req, res) {
  const { materielId, quantity } = req.body;
  const result = await service.consumeStock(req.params.id, materielId, quantity);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function close(req, res) {
  const result = await service.close(req.params.id);
  res.json(result);
}
