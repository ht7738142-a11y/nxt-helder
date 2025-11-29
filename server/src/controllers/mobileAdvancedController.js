import * as service from '../services/mobileAdvancedService.js';

// Points 176-180: Photos & Signature
export async function uploadGeoPhoto(req, res) {
  const { base64, location, timestamp, type } = req.body;
  const photo = await service.uploadGeoPhoto(req.params.chantierId, { base64, location, timestamp, type });
  if (!photo) return res.status(404).json({ error: 'Not found' });
  res.json(photo);
}

export async function verifyBiometric(req, res) {
  const { biometricToken } = req.body;
  const verification = await service.verifyBiometricSignature(req.user.id, biometricToken);
  res.json(verification);
}

export async function comparePhotos(req, res) {
  const comparison = await service.compareBeforeAfter(req.params.chantierId);
  if (!comparison) return res.status(404).json({ error: 'Not found' });
  res.json(comparison);
}

export async function validatePhoto(req, res) {
  const { base64Image } = req.body;
  const quality = await service.validatePhotoQuality(base64Image);
  res.json(quality);
}

// Points 181-185: Sync & Cache
export async function syncOffline(req, res) {
  const { changes } = req.body;
  const results = await service.syncOfflineChanges(req.user.id, changes);
  res.json(results);
}

export async function resolveConflict(req, res) {
  const { conflictId, resolution } = req.body;
  const resolved = await service.resolveConflict(conflictId, resolution);
  res.json(resolved);
}

export async function getDelta(req, res) {
  const { lastSync } = req.query;
  const delta = await service.getDeltaChanges(req.user.id, lastSync);
  res.json(delta);
}

export async function getOfflineData(req, res) {
  const { type } = req.params;
  const data = await service.getOfflineCapableData(req.user.id, type);
  res.json(data);
}

export async function queueAction(req, res) {
  const result = service.queueOfflineAction(req.body);
  res.json(result);
}
