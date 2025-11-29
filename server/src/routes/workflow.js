import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as service from '../services/workflowService.js';

const router = Router();
router.use(auth(true));

router.post('/create', requireRole('admin', 'commercial', 'chefChantier'), async (req, res) => {
  const { entityType, entityId, amount } = req.body;
  const workflow = await service.createApprovalWorkflow(entityType, entityId, amount, req.user.companyId);
  res.status(201).json(workflow);
});

router.put('/:id/approve', requireRole('admin', 'direction', 'chefChantier'), async (req, res) => {
  const workflow = await service.approveLevel(req.params.id, req.user.id, req.body.comment);
  res.json(workflow);
});

router.put('/:id/reject', requireRole('admin', 'direction'), async (req, res) => {
  const workflow = await service.rejectWorkflow(req.params.id, req.user.id, req.body.reason);
  res.json(workflow);
});

export default router;
