import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/aiController.js';

const router = Router();
router.use(auth(true));

router.get('/chantiers/:id/rentabilite', requireRole('admin', 'direction', 'chefChantier'), ctrl.analyzeRentabilite);
router.get('/chantiers/:id/delays', requireRole('admin', 'direction', 'chefChantier'), ctrl.predictDelays);
router.get('/devis/:id/optimize', requireRole('admin', 'commercial'), ctrl.optimizeDevis);
router.get('/trends', requireRole('admin', 'direction'), ctrl.analyzeTrends);
router.get('/cashflow', requireRole('admin', 'direction', 'comptable'), ctrl.forecastCashflow);
router.get('/clients/:id/health', requireRole('admin', 'direction', 'commercial'), ctrl.scoreClientHealth);

export default router;
