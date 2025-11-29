import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/devisController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
router.use(auth(true));

// uploads config
const uploadDir = path.join(process.cwd(), 'nxt-helder', 'server', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get('/', ctrl.list);

router.get('/stats', requireRole('admin', 'direction', 'commercial', 'comptable'), ctrl.stats);

router.post(
  '/',
  requireRole('admin', 'commercial'),
  validate({ body: ctrl.schemas.create }),
  ctrl.create
);

router.put(
  '/:id',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.update }),
  ctrl.update
);

router.put(
  '/:id/status',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.statusBody }),
  ctrl.updateStatus
);

router.put(
  '/:id/archive',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam }),
  ctrl.archive
);

router.put(
  '/:id/unarchive',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam }),
  ctrl.unarchive
);

router.post(
  '/:id/duplicate',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam }),
  ctrl.duplicate
);

router.post(
  '/:id/to-facture',
  requireRole('admin', 'commercial', 'comptable'),
  validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.toFactureBody }),
  ctrl.toFacture
);

router.get('/:id/pdf', validate({ params: ctrl.schemas.idParam }), ctrl.getPDF);
router.get('/:id/versions', validate({ params: ctrl.schemas.idParam }), ctrl.versions);
router.post(
  '/:id/sign',
  requireRole('admin', 'commercial'),
  validate({ params: ctrl.schemas.idParam, body: ctrl.schemas.signBody }),
  ctrl.sign
);

router.post(
  '/:id/files',
  requireRole('admin', 'commercial'),
  upload.array('files', 10),
  ctrl.addFiles
);

router.delete(
  '/:id/files/:index',
  requireRole('admin', 'commercial'),
  ctrl.removeFile
);

export default router;
