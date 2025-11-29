import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/clientsExtController.js';
import multer from 'multer';

const router = Router();
router.use(auth(true));
const upload = multer({ dest: 'uploads/' });

router.post('/import-csv', requireRole('admin', 'commercial'), upload.single('file'), ctrl.importCSV);
router.get('/export', requireRole('admin', 'commercial', 'direction'), ctrl.exportCSV);
router.get('/stats', requireRole('admin', 'direction'), ctrl.getStats);
router.post('/merge', requireRole('admin'), ctrl.merge);
router.get('/:id/ca', requireRole('admin', 'direction', 'comptable'), ctrl.getCA);
router.post('/:id/interactions', requireRole('admin', 'commercial'), ctrl.addInteraction);
router.put('/:id/archive', requireRole('admin', 'commercial'), ctrl.archive);
router.put('/:id/unarchive', requireRole('admin', 'commercial'), ctrl.unarchive);

export default router;
