import * as aiAssistant from '../services/aiAssistantService.js';
import * as ml from '../services/mlService.js';

// Points 151-160: Assistant IA & Génération
export async function chat(req, res) {
  const { message, context } = req.body;
  const response = await aiAssistant.chatWithAssistant(req.user.id, message, context);
  res.json(response);
}

export async function semanticSearch(req, res) {
  const { query } = req.query;
  const results = await aiAssistant.semanticSearch(query, req.user.id);
  res.json(results);
}

export async function summarize(req, res) {
  const { documentId, type } = req.params;
  const summary = await aiAssistant.summarizeDocument(documentId, type);
  res.json(summary);
}

export async function getSuggestions(req, res) {
  const suggestions = await aiAssistant.getProactiveSuggestions(req.user.id);
  res.json(suggestions);
}

export async function generateDevisFromText(req, res) {
  const { text } = req.body;
  const devis = await aiAssistant.generateDevisFromText(text, req.user.id);
  res.json(devis);
}

export async function voiceToDevis(req, res) {
  const { audioBase64 } = req.body;
  const devis = await aiAssistant.voiceToDevis(audioBase64, req.user.id);
  res.json(devis);
}

export async function autoComplete(req, res) {
  const { field, value } = req.query;
  const suggestions = await aiAssistant.autoComplete(field, value, req.body);
  res.json(suggestions);
}

// Points 161-170: ML Avancé
export async function detectAnomalies(req, res) {
  const result = await ml.detectBudgetAnomalies(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}

export async function predictCosts(req, res) {
  const prediction = await ml.predictFutureCosts(req.params.id);
  if (!prediction) return res.status(404).json({ error: 'Not found' });
  res.json(prediction);
}

export async function getRecommendations(req, res) {
  const recommendations = await ml.getPersonalizedRecommendations(req.user.id);
  res.json(recommendations);
}

export async function classifyExpense(req, res) {
  const { description, amount } = req.body;
  const classification = await ml.classifyExpense(description, amount);
  res.json(classification);
}

export async function scoreDevis(req, res) {
  const score = await ml.scoreDevisQuality(req.params.id);
  if (!score) return res.status(404).json({ error: 'Not found' });
  res.json(score);
}

export async function learnMargins(_req, res) {
  const learning = await ml.learnOptimalMargins();
  res.json(learning);
}

export async function optimizePrice(req, res) {
  const { item, segment, seasonality } = req.query;
  const optimized = await ml.optimizePricing(item, segment, seasonality);
  res.json(optimized);
}

export async function detectPatterns(_req, res) {
  const patterns = await ml.detectSuccessPatterns();
  res.json(patterns);
}

export async function forecastSeason(req, res) {
  const months = parseInt(req.query.months) || 12;
  const forecast = await ml.forecastSeasonality(months);
  res.json(forecast);
}
