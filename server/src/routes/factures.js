import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/facturesController.js';

const router = Router();
router.use(auth(true));

router.get('/', ctrl.list);

router.post(
  '/',
  requireRole('admin', 'comptable', 'commercial'),
  validate({ body: ctrl.schemas.create }),
  ctrl.create
);

router.put(
  '/:id/pay',
  requireRole('admin', 'comptable'),
  validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.paymentBody }),
  ctrl.pay
);

router.get('/:id/pdf', validate({ params: ctrl.schemas.idParam }), ctrl.getPDF);

export default router;
