import * as service from '../services/searchService.js';

export async function unifiedSearch(req, res) {
  const { q, types, limit } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  
  const typesArray = types ? types.split(',') : undefined;
  const results = await service.unifiedSearch(q, { types: typesArray, limit: parseInt(limit) || 20 });
  res.json(results);
}

export async function advancedFilter(req, res) {
  const { collection, ...filters } = req.query;
  if (!collection) return res.status(400).json({ error: 'Collection parameter required' });
  
  const results = await service.advancedFilter(collection, filters);
  res.json(results);
}
