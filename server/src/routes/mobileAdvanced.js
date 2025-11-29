import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/mobileAdvancedController.js';

const router = Router();
router.use(auth(true));

// Photos & Signature (176-180)
router.post('/photos/:chantierId/geo', ctrl.uploadGeoPhoto);
router.post('/biometric/verify', ctrl.verifyBiometric);
router.get('/photos/:chantierId/compare', ctrl.comparePhotos);
router.post('/photos/validate', ctrl.validatePhoto);

// Sync & Offline (181-185)
router.post('/sync/offline', ctrl.syncOffline);
router.post('/sync/resolve-conflict', ctrl.resolveConflict);
router.get('/sync/delta', ctrl.getDelta);
router.get('/offline/:type', ctrl.getOfflineData);
router.post('/offline/queue', ctrl.queueAction);

export default router;
