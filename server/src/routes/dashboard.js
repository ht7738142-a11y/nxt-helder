import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/dashboardController.js';

const router = Router();
router.use(auth(true));

router.get('/direction', requireRole('admin', 'direction'), ctrl.getDirection);
router.get('/commercial', requireRole('admin', 'commercial', 'direction'), ctrl.getCommercial);
router.get('/chef-chantier', requireRole('admin', 'chefChantier', 'direction'), ctrl.getChefChantier);
router.get('/kpis', requireRole('admin', 'direction'), ctrl.getGlobalKPIs);

export default router;
