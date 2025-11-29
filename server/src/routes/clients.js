import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/clientsController.js';

const router = Router();
router.use(auth(true));

router.get('/', ctrl.list);

router.get('/:id', validate({ params: ctrl.schemas.updateParams }), ctrl.getOne);

router.post('/', requireRole('admin','commercial'), validate({ body: ctrl.schemas.create }), ctrl.create);

router.put('/:id', requireRole('admin','commercial'), validate({ params: ctrl.schemas.updateParams, body: ctrl.schemas.updateBody }), ctrl.update);

router.delete('/:id', requireRole('admin'), validate({ params: ctrl.schemas.updateParams }), ctrl.remove);

export default router;
