import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/aiAdvancedController.js';

const router = Router();
router.use(auth(true));

// Assistant IA (151-160)
router.post('/chat', ctrl.chat);
router.get('/search/semantic', ctrl.semanticSearch);
router.get('/summarize/:type/:documentId', ctrl.summarize);
router.get('/suggestions', ctrl.getSuggestions);
router.post('/generate/devis/text', ctrl.generateDevisFromText);
router.post('/generate/devis/voice', ctrl.voiceToDevis);
router.get('/autocomplete', ctrl.autoComplete);

// ML Avancé (161-170)
router.get('/ml/anomalies/:id', requireRole('admin', 'direction', 'chefChantier'), ctrl.detectAnomalies);
router.get('/ml/predict-costs/:id', requireRole('admin', 'direction', 'chefChantier'), ctrl.predictCosts);
router.get('/ml/recommendations', ctrl.getRecommendations);
router.post('/ml/classify-expense', requireRole('admin', 'comptable'), ctrl.classifyExpense);
router.get('/ml/score-devis/:id', requireRole('admin', 'commercial'), ctrl.scoreDevis);
router.get('/ml/learn-margins', requireRole('admin', 'direction'), ctrl.learnMargins);
router.get('/ml/optimize-price', requireRole('admin', 'commercial'), ctrl.optimizePrice);
router.get('/ml/patterns', requireRole('admin', 'direction'), ctrl.detectPatterns);
router.get('/ml/forecast-season', requireRole('admin', 'direction'), ctrl.forecastSeason);

export default router;
