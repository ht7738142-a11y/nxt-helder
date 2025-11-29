import { Router } from 'express';
import * as service from '../services/mobileService.js';

const router = Router();

// Portail client avec authentification spécifique
router.get('/:clientId', async (req, res) => {
  const { token } = req.query;
  
  // Validation token portail client
  const validation = await service.validateClientPortalToken(token, req.params.clientId);
  if (!validation.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const data = await service.getClientPortalData(req.params.clientId);
  res.json(data);
});

// Télécharger devis/facture depuis portail
router.get('/:clientId/documents/:type/:id', async (req, res) => {
  // TODO: Vérifier droits client + générer PDF
  res.json({ message: 'Document generation endpoint' });
});

export default router;
