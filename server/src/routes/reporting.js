import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as service from '../services/reportingService.js';

const router = Router();
router.use(auth(true));

router.get('/monthly', requireRole('admin', 'direction', 'comptable'), async (req, res) => {
  const { year, month } = req.query;
  const report = await service.generateMonthlyReport(parseInt(year), parseInt(month), req.user.companyId);
  res.json(report);
});

router.get('/grand-livre', requireRole('admin', 'comptable'), async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await service.generateGrandLivre(startDate, endDate, req.user.companyId);
  res.json(data);
});

router.get('/balance', requireRole('admin', 'direction', 'comptable'), async (req, res) => {
  const { year } = req.query;
  const balance = await service.generateBalance(parseInt(year), req.user.companyId);
  res.json(balance);
});

router.get('/fec', requireRole('admin', 'comptable'), async (req, res) => {
  const { year } = req.query;
  const fec = await service.exportFEC(parseInt(year), req.user.companyId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="FEC_${year}.csv"`);
  res.send(fec);
});

router.get('/liasse-fiscale', requireRole('admin', 'comptable'), async (req, res) => {
  const { year } = req.query;
  const liasse = await service.generateLiasseFiscale(parseInt(year), req.user.companyId);
  res.json(liasse);
});

export default router;
