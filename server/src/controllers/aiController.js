import * as service from '../services/aiService.js';

export async function analyzeRentabilite(req, res) {
  const result = await service.analyzeRentabilite(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function predictDelays(req, res) {
  const result = await service.predictDelays(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function optimizeDevis(req, res) {
  const result = await service.optimizeDevis(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function analyzeTrends(req, res) {
  const months = parseInt(req.query.months) || 6;
  const result = await service.analyzeTrends(months);
  res.json(result);
}

export async function forecastCashflow(req, res) {
  const days = parseInt(req.query.days) || 90;
  const result = await service.forecastCashflow(days);
  res.json(result);
}

export async function scoreClientHealth(req, res) {
  const result = await service.scoreClientHealth(req.params.id);
  res.json(result);
}
