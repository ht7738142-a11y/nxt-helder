import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as service from '../services/mobileService.js';

const router = Router();
router.use(auth(true));

router.get('/data/:type', async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const data = await service.getMobileData(req.user.id, type, parseInt(page), parseInt(limit));
  res.json(data);
});

router.post('/signature/:devisId', async (req, res) => {
  const { signatureBase64 } = req.body;
  const devis = await service.saveMobileSignature(req.params.devisId, signatureBase64, req.user.id);
  if (!devis) return res.status(404).json({ error: 'Not found' });
  res.json(devis);
});

router.post('/pointage/:chantierId', async (req, res) => {
  const { hours, location } = req.body;
  const chantier = await service.createMobilePointage(req.params.chantierId, req.user.id, hours, location);
  if (!chantier) return res.status(404).json({ error: 'Not found' });
  res.json(chantier);
});

router.post('/sync', async (req, res) => {
  const results = await service.syncOfflineData(req.user.id, req.body);
  res.json(results);
});

export default router;
