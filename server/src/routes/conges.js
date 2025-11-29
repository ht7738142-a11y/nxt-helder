import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/congesController.js';

const router = Router();
router.use(auth(true));

router.get('/', ctrl.list);
router.post('/', validate({ body: ctrl.schemas.create }), ctrl.create);
router.put('/:id', validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.update }), ctrl.update);
router.delete('/:id', requireRole('admin', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.remove);
router.put('/:id/approve', requireRole('admin', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.approve);
router.put('/:id/reject', requireRole('admin', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.reject);

export default router;
