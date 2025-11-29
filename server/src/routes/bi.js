import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/biController.js';

const router = Router();
router.use(auth(true));

// BI & Analytics (186-195)
router.get('/metabase/config', requireRole('admin', 'direction'), ctrl.getMetabaseConfig);
router.get('/metabase/token/:dashboardId', requireRole('admin', 'direction'), ctrl.generateMetabaseToken);
router.post('/olap/cube', requireRole('admin', 'direction'), ctrl.getOLAPCube);
router.post('/olap/drill-down', requireRole('admin', 'direction'), ctrl.drillDown);
router.post('/kpis/custom', ctrl.getCustomKPIs);
router.get('/forecast/growth', requireRole('admin', 'direction'), ctrl.forecastGrowth);
router.get('/segment/clients', requireRole('admin', 'direction', 'commercial'), ctrl.segmentClients);
router.get('/analyze/market', requireRole('admin', 'direction'), ctrl.analyzeMarket);
router.get('/recommendations/strategic', requireRole('admin', 'direction'), ctrl.getStrategicRecommendations);

// Export avancé (196-200)
router.post('/export/excel/:type', requireRole('admin', 'direction', 'comptable'), ctrl.exportExcel);
router.post('/export/pdf/custom', requireRole('admin', 'direction'), ctrl.exportCustomPDF);
router.get('/export/:type/:format', requireRole('admin', 'direction', 'comptable'), ctrl.exportMultiFormat);

export default router;
