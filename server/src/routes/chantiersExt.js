import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/chantiersExtController.js';

const router = Router();
router.use(auth(true));

router.post('/:id/pointage', requireRole('admin', 'chefChantier', 'ouvrier'), ctrl.addPointage);
router.post('/:id/incident', requireRole('admin', 'chefChantier'), ctrl.addIncident);
router.post('/:id/daily-report', requireRole('admin', 'chefChantier'), ctrl.addDailyReport);
router.get('/:id/kpis', requireRole('admin', 'direction', 'chefChantier'), ctrl.getKPIs);
router.get('/:id/pdf', requireRole('admin', 'direction', 'chefChantier'), ctrl.getPDF);
router.get('/stats', requireRole('admin', 'direction'), ctrl.getStats);
router.post('/:id/consume-stock', requireRole('admin', 'chefChantier'), ctrl.consumeStock);
router.put('/:id/close', requireRole('admin', 'chefChantier'), ctrl.close);

export default router;
