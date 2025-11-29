import * as service from '../services/materielsService.js';

export async function moveStock(req, res) {
  const { quantity, type, reason, chantier } = req.body;
  const result = await service.moveStock(req.params.id, quantity, type, reason, chantier);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function getLowStock(_req, res) {
  const items = await service.getLowStock();
  res.json(items);
}

export async function getValuation(_req, res) {
  const data = await service.getValuation();
  res.json(data);
}
