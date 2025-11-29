import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/companyController.js';

const router = Router();
router.use(auth(true));

router.get('/', requireRole('admin'), ctrl.list);
router.get('/:id', requireRole('admin', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.get);
router.post('/', requireRole('admin'), validate({ body: ctrl.schemas.create }), ctrl.create);
router.put('/:id', requireRole('admin'), validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.update }), ctrl.update);
router.put('/:id/settings', requireRole('admin'), validate({ params: ctrl.schemas.idParam }), ctrl.updateSettings);
router.put('/:id/branding', requireRole('admin'), validate({ params: ctrl.schemas.idParam }), ctrl.updateBranding);

export default router;
