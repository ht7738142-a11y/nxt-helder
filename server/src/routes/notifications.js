import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();
router.use(auth(true));

router.get('/', async (req, res) => {
  const items = await Notification.find({ $or: [{ user: null }, { user: req.user?.id }] }).sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const item = await Notification.create(req.body);
  res.json(item);
});

router.put('/:id/read', async (req, res) => {
  const item = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(item);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
