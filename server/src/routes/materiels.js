import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Materiel from '../models/Materiel.js';

const router = Router();
router.use(auth(true));

router.get('/', async (_req, res) => {
  const items = await Materiel.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireRole('admin','commercial'), async (req, res) => {
  const item = await Materiel.create(req.body);
  res.json(item);
});

router.put('/:id', requireRole('admin','commercial'), async (req, res) => {
  const item = await Materiel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Materiel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
