import * as service from '../services/facturesService.js';
import { toCSV } from '../utils/csv.js';

export async function exportCompta(req, res) {
  const { format, start, end } = req.query;
  const rows = await service.exportCompta(format, start, end);
  if (format === 'csv') {
    const csv = toCSV(rows, ['number', 'date', 'client', 'subtotal', 'tax', 'total', 'status']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="export_compta.csv"');
    return res.send(csv);
  }
  res.json(rows);
}

export async function getTVAJournal(req, res) {
  const { start, end } = req.query;
  const data = await service.getTVAJournal(start, end);
  res.json(data);
}
