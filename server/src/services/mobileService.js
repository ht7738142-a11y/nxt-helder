import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';

// Point 146-150: API Mobile + Portail Client

// Point 146: API optimisée mobile (pagination, champs limités)
export async function getMobileData(userId, type, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const selectFields = 'title status createdAt client totals'; // Champs essentiels
  
  const models = {
    devis: Devis,
    factures: Facture,
    chantiers: Chantier
  };
  
  const Model = models[type];
  if (!Model) return { items: [], total: 0 };
  
  const [items, total] = await Promise.all([
    Model.find({ author: userId })
      .select(selectFields)
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // Optimisation performance
    Model.countDocuments({ author: userId })
  ]);
  
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

// Point 147: Portail client (accès limité)
export async function getClientPortalData(clientId) {
  const [devis, factures] = await Promise.all([
    Devis.find({ client: clientId })
      .select('title number status totals createdAt')
      .sort({ createdAt: -1 }),
    Facture.find({ client: clientId })
      .select('number status totals createdAt payments')
      .sort({ createdAt: -1 })
  ]);
  
  const stats = {
    totalDevis: devis.length,
    devisApproved: devis.filter(d => d.status === 'approved').length,
    totalFactures: factures.length,
    facturesPaid: factures.filter(f => f.status === 'paid').length,
    totalDue: factures
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0)
  };
  
  return { devis, factures, stats };
}

// Point 148: Signature mobile (canvas → base64)
export async function saveMobileSignature(devisId, signatureBase64, userId) {
  const devis = await Devis.findById(devisId);
  if (!devis) return null;
  
  // TODO: Sauvegarder image base64 sur serveur/S3
  const signaturePath = `/signatures/${devisId}_${Date.now()}.png`;
  
  devis.signature = {
    by: userId,
    at: new Date(),
    path: signaturePath,
    method: 'mobile'
  };
  
  await devis.save();
  return devis;
}

// Point 149: Pointage mobile avec géolocalisation
export async function createMobilePointage(chantierId, userId, hours, location) {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return null;
  
  chantier.pointages.push({
    user: userId,
    date: new Date(),
    hours,
    location: {
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy
    },
    note: 'Pointage mobile'
  });
  
  await chantier.save();
  return chantier;
}

// Point 150: Push notifications mobile (FCM/APNS)
export async function sendPushNotification(userId, title, body, data = {}) {
  // TODO: Intégrer Firebase Cloud Messaging ou Apple Push Notification Service
  // Pour l'instant: structure mock
  
  const notification = {
    userId,
    title,
    body,
    data,
    platform: 'ios', // ou 'android'
    sentAt: new Date(),
    status: 'sent'
  };
  
  // En production: utiliser SDK Firebase Admin
  // const message = {
  //   notification: { title, body },
  //   data,
  //   token: userDeviceToken
  // };
  // await admin.messaging().send(message);
  
  return notification;
}

// Fonction helper: Validation token portail client
export async function validateClientPortalToken(token, clientId) {
  // Token JWT spécifique portail client avec permissions limitées
  // TODO: Implémenter avec jsonwebtoken
  return { valid: true, clientId };
}

// Point 146 bis: Sync offline mobile
export async function syncOfflineData(userId, offlineData) {
  // Synchroniser données créées offline
  const results = {
    pointages: [],
    photos: [],
    notes: []
  };
  
  // Traiter chaque type de donnée offline
  if (offlineData.pointages) {
    for (const p of offlineData.pointages) {
      const result = await createMobilePointage(p.chantierId, userId, p.hours, p.location);
      results.pointages.push({ localId: p.localId, serverId: result._id });
    }
  }
  
  return results;
}
