import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/usersController.js';

const router = Router();
router.use(auth(true));

// List all users - admin, direction
router.get('/', requireRole('admin', 'direction'), ctrl.list);

// Get one user - admin, direction
router.get('/:id', requireRole('admin', 'direction'), validate({ params: ctrl.schemas.idParam }), ctrl.get);

// Create user - admin only
router.post('/', requireRole('admin'), validate({ body: ctrl.schemas.create }), ctrl.create);

// Update user - admin only (direction cannot changer roles par défaut)
router.put('/:id', requireRole('admin'), validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.update }), ctrl.update);

// Delete user - admin only
router.delete('/:id', requireRole('admin'), validate({ params: ctrl.schemas.idParam }), ctrl.remove);

export default router;
