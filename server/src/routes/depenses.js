import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Depense from '../models/Depense.js';

const router = Router();
router.use(auth(true));

router.get('/', async (_req, res) => {
  const items = await Depense.find().populate('chantier').sort({ date: -1 });
  res.json(items);
});

router.post('/', requireRole('admin','comptable','commercial'), async (req, res) => {
  const item = await Depense.create(req.body);
  res.json(item);
});

router.put('/:id', requireRole('admin','comptable'), async (req, res) => {
  const item = await Depense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Depense.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
