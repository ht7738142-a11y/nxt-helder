import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/devisTemplatesController.js';

const router = Router();
router.use(auth(true));

router.get('/', requireRole('admin', 'commercial', 'direction'), ctrl.list);
router.get('/:id', requireRole('admin', 'commercial', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.get);
router.post('/', requireRole('admin', 'commercial'), validate({ body: ctrl.schemas.create }), ctrl.create);
router.put('/:id', requireRole('admin', 'commercial'), validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.update }), ctrl.update);
router.delete('/:id', requireRole('admin'), validate({ params: ctrl.schemas.idParam }), ctrl.remove);

export default router;
