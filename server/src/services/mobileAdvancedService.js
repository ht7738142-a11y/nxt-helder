// Points 171-185: Mobile React Native Avancé

import Chantier from '../models/Chantier.js';
import Devis from '../models/Devis.js';
import fs from 'fs/promises';
import path from 'path';

// Point 176-177: Photos géolocalisées avant/après
export async function uploadGeoPhoto(chantierId, photoData) {
  const { base64, location, timestamp, type } = photoData; // type: 'before' | 'after'
  
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return null;
  
  // Sauvegarder image
  const filename = `${chantierId}_${type}_${Date.now()}.jpg`;
  const filepath = path.join('uploads', 'chantiers', filename);
  
  // TODO: Sauvegarder sur S3 ou serveur fichiers
  // await fs.writeFile(filepath, Buffer.from(base64, 'base64'));
  
  const photo = {
    filename,
    path: filepath,
    type,
    location: {
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy
    },
    timestamp: new Date(timestamp),
    size: Buffer.from(base64, 'base64').length
  };
  
  chantier.files.push(photo);
  await chantier.save();
  
  return photo;
}

// Point 178: Signature biométrique (Touch ID / Face ID)
export async function verifyBiometricSignature(userId, biometricToken) {
  // Vérifier token biométrique (généré par mobile avec Touch ID/Face ID)
  // En production: vérifier signature cryptographique
  
  const isValid = biometricToken && biometricToken.length > 20;
  
  return {
    valid: isValid,
    userId,
    timestamp: new Date(),
    method: 'biometric',
    deviceId: biometricToken.substring(0, 10)
  };
}

// Point 179: Photos comparaison avant/après automatique
export async function compareBeforeAfter(chantierId) {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return null;
  
  const beforePhotos = chantier.files.filter(f => f.type === 'before');
  const afterPhotos = chantier.files.filter(f => f.type === 'after');
  
  // TODO: Utiliser IA pour comparer images (détection changements)
  // const comparison = await analyzeImageDifferences(before, after);
  
  return {
    chantierId,
    beforeCount: beforePhotos.length,
    afterCount: afterPhotos.length,
    pairs: beforePhotos.map((b, i) => ({
      before: b.path,
      after: afterPhotos[i]?.path,
      location: b.location,
      timeDiff: afterPhotos[i] ? (afterPhotos[i].timestamp - b.timestamp) / 86400000 : null
    })),
    completionRate: (afterPhotos.length / beforePhotos.length) * 100
  };
}

// Point 180: Validation qualité photo automatique
export async function validatePhotoQuality(base64Image) {
  // TODO: Utiliser IA pour vérifier qualité (flou, exposition, etc.)
  const imageSize = Buffer.from(base64Image, 'base64').length;
  
  const quality = {
    resolution: imageSize > 500000 ? 'high' : imageSize > 100000 ? 'medium' : 'low',
    size: imageSize,
    issues: []
  };
  
  if (imageSize < 50000) quality.issues.push('Image trop petite');
  if (imageSize > 5000000) quality.issues.push('Image trop lourde (compresser)');
  
  quality.score = 100 - (quality.issues.length * 25);
  quality.valid = quality.score >= 50;
  
  return quality;
}

// Point 181-182: Sync bidirectionnel offline → online
export async function syncOfflineChanges(userId, changes) {
  const results = {
    synced: 0,
    conflicts: [],
    errors: []
  };
  
  for (const change of changes) {
    try {
      const result = await applySyncChange(change, userId);
      if (result.conflict) {
        results.conflicts.push({ localId: change.localId, conflict: result.conflict });
      } else {
        results.synced++;
      }
    } catch (error) {
      results.errors.push({ localId: change.localId, error: error.message });
    }
  }
  
  return results;
}

async function applySyncChange(change, userId) {
  const { entity, localId, action, data, timestamp } = change;
  
  // Vérifier si modification serveur plus récente (conflit)
  if (entity === 'devis') {
    const existing = await Devis.findById(data._id);
    if (existing && existing.updatedAt > new Date(timestamp)) {
      return { conflict: { server: existing, client: data } };
    }
    
    if (action === 'update') {
      await Devis.findByIdAndUpdate(data._id, data);
    } else if (action === 'create') {
      await Devis.create({ ...data, author: userId });
    }
  }
  
  return { success: true, serverId: data._id };
}

// Point 183: Résolution conflits intelligente
export async function resolveConflict(conflictId, resolution) {
  // resolution: 'server' | 'client' | 'merge'
  const conflict = await getConflictById(conflictId);
  
  if (resolution === 'merge') {
    // Merger intelligemment les deux versions
    const merged = {
      ...conflict.serverVersion,
      notes: `${conflict.serverVersion.notes}\n${conflict.clientVersion.notes}`,
      items: [...conflict.serverVersion.items, ...conflict.clientVersion.items]
    };
    return merged;
  }
  
  return resolution === 'server' ? conflict.serverVersion : conflict.clientVersion;
}

async function getConflictById(id) {
  // Mock - en production: stocker conflits dans DB
  return {
    id,
    serverVersion: {},
    clientVersion: {},
    timestamp: new Date()
  };
}

// Point 184: Cache intelligent avec TTL
const cache = new Map();

export async function getCachedData(key, fetchFn, ttl = 300000) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return { data: cached.data, fromCache: true };
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  
  return { data, fromCache: false };
}

export function invalidateCache(pattern) {
  // Invalider cache selon pattern (ex: 'devis:*')
  for (const key of cache.keys()) {
    if (key.startsWith(pattern.replace('*', ''))) {
      cache.delete(key);
    }
  }
}

// Point 185: Optimisation bande passante mobile
export async function compressPayload(data, level = 'medium') {
  // Compression différentielle (envoyer que les changements)
  const compressed = {
    original: data,
    size: JSON.stringify(data).length
  };
  
  if (level === 'high') {
    // Supprimer champs non essentiels
    compressed.data = removeNonEssentialFields(data);
  } else if (level === 'medium') {
    // Raccourcir descriptions longues
    compressed.data = truncateLongFields(data);
  } else {
    compressed.data = data;
  }
  
  compressed.compressedSize = JSON.stringify(compressed.data).length;
  compressed.ratio = (1 - compressed.compressedSize / compressed.size).toFixed(2);
  
  return compressed;
}

function removeNonEssentialFields(data) {
  // Retirer timestamps, metadata, etc.
  const essential = { ...data };
  delete essential.createdAt;
  delete essential.updatedAt;
  delete essential.__v;
  return essential;
}

function truncateLongFields(data) {
  const truncated = { ...data };
  if (truncated.notes && truncated.notes.length > 200) {
    truncated.notes = truncated.notes.substring(0, 200) + '...';
  }
  return truncated;
}

// Point 171-172: Offline-first architecture
export async function getOfflineCapableData(userId, entityType) {
  // Retourner données avec metadata pour offline
  const data = await fetchEntityData(userId, entityType);
  
  return {
    data,
    meta: {
      lastSync: new Date(),
      version: 1,
      offlineCapable: true,
      cacheUntil: new Date(Date.now() + 3600000) // 1h
    }
  };
}

async function fetchEntityData(userId, entityType) {
  const models = { devis: Devis, chantiers: Chantier };
  return models[entityType]?.find({ author: userId }).limit(50).lean() || [];
}

// Point 173: Queue actions offline
export function queueOfflineAction(action) {
  // Stocker action dans queue pour sync ultérieur
  const queue = getOfflineQueue();
  queue.push({
    id: `action_${Date.now()}`,
    ...action,
    queuedAt: new Date()
  });
  saveOfflineQueue(queue);
  return { queued: true, position: queue.length };
}

function getOfflineQueue() {
  // En production: lire depuis AsyncStorage/Realm
  return [];
}

function saveOfflineQueue(queue) {
  // En production: sauver dans AsyncStorage/Realm
  return queue;
}

// Point 174: Retry automatique avec backoff
export async function retryWithBackoff(fn, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Point 175: Delta sync (uniquement changements)
export async function getDeltaChanges(userId, lastSyncTimestamp) {
  const since = new Date(lastSyncTimestamp);
  
  const [devisChanges, chantierChanges] = await Promise.all([
    Devis.find({ author: userId, updatedAt: { $gt: since } }).lean(),
    Chantier.find({ manager: userId, updatedAt: { $gt: since } }).lean()
  ]);
  
  return {
    devis: devisChanges,
    chantiers: chantierChanges,
    timestamp: new Date(),
    count: devisChanges.length + chantierChanges.length
  };
}
