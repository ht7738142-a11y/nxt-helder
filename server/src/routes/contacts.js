import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/contactsController.js';

const router = Router();
router.use(auth(true));

// GET /contacts
router.get('/', ctrl.list);

// GET /contacts/search?q=...
router.get('/search', ctrl.search);

// GET /contacts/stats
router.get('/stats', ctrl.stats);

// GET /contacts/:id
router.get('/:id', validate({ params: ctrl.schemas.updateParams }), ctrl.getOne);

// POST /contacts
router.post('/', requireRole('admin', 'commercial'), validate({ body: ctrl.schemas.create }), ctrl.create);

// PUT /contacts/:id
router.put('/:id', requireRole('admin', 'commercial'), validate({ params: ctrl.schemas.updateParams, body: ctrl.schemas.updateBody }), ctrl.update);

// DELETE /contacts/:id
router.delete('/:id', requireRole('admin'), validate({ params: ctrl.schemas.updateParams }), ctrl.remove);

export default router;
