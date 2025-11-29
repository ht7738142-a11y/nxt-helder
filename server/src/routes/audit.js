import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/auditController.js';

const router = Router();
router.use(auth(true));

router.get('/', requireRole('admin', 'direction'), validate({ query: ctrl.schemas.listQuery }), ctrl.list);
router.get('/export', requireRole('admin', 'direction'), ctrl.exportCSV);
router.get('/activity', requireRole('admin', 'direction'), ctrl.feed);

export default router;
