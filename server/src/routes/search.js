import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/searchController.js';

const router = Router();
router.use(auth(true));

router.get('/unified', ctrl.unifiedSearch);
router.get('/advanced', ctrl.advancedFilter);

export default router;
