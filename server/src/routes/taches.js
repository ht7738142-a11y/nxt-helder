import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Tache from '../models/Tache.js';

const router = Router();
router.use(auth(true));

router.get('/', async (_req, res) => {
  const items = await Tache.find().populate('assignedTo').populate('chantier').sort({ start: 1 });
  res.json(items);
});

router.post('/', requireRole('admin','commercial','ouvrier'), async (req, res) => {
  const item = await Tache.create(req.body);
  res.json(item);
});

router.put('/:id', requireRole('admin','commercial','ouvrier'), async (req, res) => {
  const item = await Tache.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Tache.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
