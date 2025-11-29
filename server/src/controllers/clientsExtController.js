import * as service from '../services/clientsService.js';
import { parseCSV, toCSV } from '../utils/csv.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export async function importCSV(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const text = require('fs').readFileSync(req.file.path, 'utf-8');
    const rows = parseCSV(text);
    const result = await service.importCSV(rows);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function exportCSV(_req, res) {
  const data = await service.exportCSV();
  const csv = toCSV(data, ['name', 'company', 'email', 'phone', 'vat', 'segment', 'createdAt']);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
  res.send(csv);
}

export async function getCA(req, res) {
  const ca = await service.getCA(req.params.id);
  res.json({ ca });
}

export async function getStats(_req, res) {
  const stats = await service.getStats();
  res.json(stats);
}

export async function merge(req, res) {
  const { sourceId, targetId } = req.body;
  const result = await service.mergeClients(sourceId, targetId);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function addInteraction(req, res) {
  const result = await service.addInteraction(req.params.id, { ...req.body, user: req.user?.id });
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function archive(req, res) {
  const result = await service.setArchived(req.params.id, true);
  res.json(result);
}

export async function unarchive(req, res) {
  const result = await service.setArchived(req.params.id, false);
  res.json(result);
}
