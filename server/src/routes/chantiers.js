import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, requireRole } from '../middleware/auth.js';
import Chantier from '../models/Chantier.js';

const router = Router();
router.use(auth(true));

// storage
const uploadDir = path.join(process.cwd(), 'nxt-helder', 'server', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })

router.get('/', async (_req, res) => {
  const items = await Chantier.find().populate('client').populate('manager').sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireRole('admin','commercial'), async (req, res) => {
  const item = await Chantier.create(req.body);
  res.json(item);
});

router.put('/:id', requireRole('admin','commercial'), async (req, res) => {
  const item = await Chantier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

// Team management
router.get('/:id/team', async (req, res) => {
  const chantier = await Chantier.findById(req.params.id).populate('team.contact');
  if (!chantier) return res.status(404).json({ error: 'Not found' });
  res.json(chantier.team || []);
});

router.post('/:id/team', requireRole('admin','commercial'), async (req, res) => {
  const { contact, profile, note } = req.body;
  const chantier = await Chantier.findById(req.params.id);
  if (!chantier) return res.status(404).json({ error: 'Not found' });
  // éviter doublons
  const exists = (chantier.team || []).some(t => String(t.contact) === String(contact));
  if (!exists) {
    chantier.team.push({ contact, profile, note });
    await chantier.save();
  }
  const populated = await Chantier.findById(req.params.id).populate('team.contact');
  res.json(populated.team);
});

router.delete('/:id/team/:contactId', requireRole('admin','commercial'), async (req, res) => {
  const chantier = await Chantier.findById(req.params.id);
  if (!chantier) return res.status(404).json({ error: 'Not found' });
  chantier.team = (chantier.team || []).filter(t => String(t.contact) !== String(req.params.contactId));
  await chantier.save();
  res.json({ ok: true });
});

router.post('/:id/files', requireRole('admin','commercial'), upload.array('files', 10), async (req, res) => {
  const chantier = await Chantier.findById(req.params.id)
  if (!chantier) return res.status(404).json({ error: 'Not found' })
  const mapped = (req.files||[]).map(f=>({ name: f.originalname, path: `/uploads/${path.basename(f.path)}`, type: f.mimetype, size: f.size }))
  chantier.files.push(...mapped)
  await chantier.save()
  res.json(chantier)
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Chantier.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
