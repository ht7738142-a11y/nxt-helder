import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/facturesExtController.js';

const router = Router();
router.use(auth(true));

router.get('/export-compta', requireRole('admin', 'comptable'), ctrl.exportCompta);
router.get('/tva-journal', requireRole('admin', 'comptable'), ctrl.getTVAJournal);

export default router;
