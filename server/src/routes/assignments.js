import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/assignmentsController.js';

const router = Router();
router.use(auth(true));

// GET /assignments?start=...&end=...&chantier=...&contact=...
router.get('/', ctrl.list);

// GET /assignments/conflicts?contactId=...&startDatetime=...&endDatetime=...
router.get('/conflicts', ctrl.checkConflicts);

// GET /assignments/stats?start=...&end=...
router.get('/stats', ctrl.stats);

// GET /assignments/:id
router.get('/:id', validate({ params: ctrl.schemas.updateParams }), ctrl.getOne);

// POST /assignments
router.post('/', requireRole('admin', 'commercial', 'chef_chantier'), validate({ body: ctrl.schemas.create }), ctrl.create);

// PUT /assignments/:id
router.put('/:id', requireRole('admin', 'commercial', 'chef_chantier'), validate({ params: ctrl.schemas.updateParams, body: ctrl.schemas.updateBody }), ctrl.update);

// DELETE /assignments/:id
router.delete('/:id', requireRole('admin', 'commercial'), validate({ params: ctrl.schemas.updateParams }), ctrl.remove);

// POST /assignments/:id/contacts
router.post('/:id/contacts', requireRole('admin', 'commercial', 'chef_chantier'), validate({ params: ctrl.schemas.updateParams, body: ctrl.schemas.addContact }), ctrl.addContact);

// DELETE /assignments/:id/contacts/:contactId
router.delete('/:id/contacts/:contactId', requireRole('admin', 'commercial', 'chef_chantier'), ctrl.removeContact);

export default router;
