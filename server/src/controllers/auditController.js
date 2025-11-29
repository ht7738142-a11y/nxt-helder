import Joi from 'joi';
import AuditLog from '../models/AuditLog.js';

export const schemas = {
  listQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    user: Joi.string().hex().length(24).optional(),
    collection: Joi.string().optional(),
    action: Joi.string().optional(),
  }),
};

export async function list(req, res) {
  const { page, limit, user, collection, action } = req.validated.query;
  const filter = {};
  if (user) filter.user = user;
  if (collection) filter.collection = collection;
  if (action) filter.action = action;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ items, page, limit, total });
}

export async function feed(_req, res) {
  const items = await AuditLog.find({})
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ items });
}

export async function exportCSV(req, res) {
  const { user, collection, action } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (collection) filter.collection = collection;
  if (action) filter.action = action;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
  const cursor = AuditLog.find(filter).populate('user', 'name email role').sort({ createdAt: -1 }).cursor();
  res.write('date,user_name,user_email,user_role,action,collection,documentId,before,after\n');
  for await (const doc of cursor) {
    const u = doc.user || {};
    const line = [
      doc.createdAt?.toISOString() || '',
      (u.name || '').replaceAll(',', ' '),
      (u.email || '').replaceAll(',', ' '),
      (u.role || '').replaceAll(',', ' '),
      (doc.action || '').replaceAll(',', ' '),
      (doc.collection || '').replaceAll(',', ' '),
      (doc.documentId || '').replaceAll(',', ' '),
      JSON.stringify(doc.before || {}).replaceAll('\n', ' ').replaceAll(',', ';'),
      JSON.stringify(doc.after || {}).replaceAll('\n', ' ').replaceAll(',', ';'),
    ].join(',');
    res.write(line + '\n');
  }
  res.end();
}
