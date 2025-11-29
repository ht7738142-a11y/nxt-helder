import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/materielsExtController.js';

const router = Router();
router.use(auth(true));

router.post('/:id/move', requireRole('admin', 'chefChantier'), ctrl.moveStock);
router.get('/low-stock', requireRole('admin', 'direction', 'chefChantier'), ctrl.getLowStock);
router.get('/valuation', requireRole('admin', 'direction', 'comptable'), ctrl.getValuation);

export default router;
