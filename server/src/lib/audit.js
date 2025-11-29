import AuditLog from '../models/AuditLog.js';

export async function log({ userId, action, collection, documentId, before, after, meta }) {
  try {
    await AuditLog.create({ user: userId || null, action, collection, documentId, before, after, meta });
  } catch {}
}
