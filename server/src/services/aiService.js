import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';

// Point 101: Analyse rentabilité projet
export async function analyzeRentabilite(chantierId) {
  const chantier = await Chantier.findById(chantierId).populate('client');
  if (!chantier) return null;
  
  const margin = chantier.costEstimate > 0 ? ((chantier.costEstimate - chantier.costActual) / chantier.costEstimate) * 100 : 0;
  const profitability = margin > 20 ? 'excellent' : margin > 10 ? 'good' : margin > 0 ? 'low' : 'negative';
  
  return {
    chantierId,
    margin: margin.toFixed(2),
    profitability,
    costEstimate: chantier.costEstimate,
    costActual: chantier.costActual,
    recommendations: margin < 10 ? ['Réduire coûts matériaux', 'Optimiser temps ouvriers'] : ['Maintenir performance']
  };
}

// Point 102: Prédiction délais
export async function predictDelays(chantierId) {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier || !chantier.endDate) return null;
  
  const today = new Date();
  const daysRemaining = Math.ceil((chantier.endDate - today) / 86400000);
  const progressRate = chantier.progress || 0;
  const expectedProgress = daysRemaining > 0 ? 100 - (daysRemaining / 30) * 100 : 100;
  const delay = progressRate < expectedProgress ? Math.ceil(expectedProgress - progressRate) : 0;
  
  return {
    chantierId,
    daysRemaining,
    progress: progressRate,
    expectedProgress: expectedProgress.toFixed(1),
    delayRisk: delay > 10 ? 'high' : delay > 5 ? 'medium' : 'low',
    estimatedDelay: delay,
    recommendations: delay > 5 ? ['Augmenter effectifs', 'Prolonger heures travail'] : []
  };
}

// Point 103: Suggestions optimisation devis
export async function optimizeDevis(devisId) {
  const devis = await Devis.findById(devisId);
  if (!devis) return null;
  
  const suggestions = [];
  const totalCost = devis.totals?.grandTotal || 0;
  
  if (totalCost < 5000) suggestions.push('Proposer package premium (+15%)');
  if (devis.items.length > 10) suggestions.push('Regrouper items similaires');
  if (!devis.marginRate || devis.marginRate < 0.15) suggestions.push('Augmenter marge à 15% minimum');
  
  return { devisId, suggestions, currentTotal: totalCost, optimizedTotal: totalCost * 1.1 };
}

// Point 104: Analyse tendances CA
export async function analyzeTrends(months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const factures = await Facture.find({ createdAt: { $gte: startDate }, status: { $in: ['paid', 'partial'] } });
  
  const byMonth = {};
  factures.forEach(f => {
    const month = new Date(f.createdAt).toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + (f.totals?.grandTotal || 0);
  });
  
  const trend = Object.values(byMonth);
  const avgGrowth = trend.length > 1 ? ((trend[trend.length - 1] - trend[0]) / trend[0]) * 100 : 0;
  
  return {
    period: `${months} months`,
    byMonth,
    avgGrowth: avgGrowth.toFixed(2),
    trend: avgGrowth > 5 ? 'growing' : avgGrowth < -5 ? 'declining' : 'stable'
  };
}

// Point 105: Prévisions trésorerie
export async function forecastCashflow(days = 90) {
  const today = new Date();
  const endDate = new Date(today.getTime() + days * 86400000);
  
  const factures = await Facture.find({ 
    status: { $in: ['unpaid', 'partial'] },
    createdAt: { $lte: endDate }
  });
  
  let expectedIn = 0;
  let overdueAmount = 0;
  
  factures.forEach(f => {
    const remaining = (f.totals?.grandTotal || 0) - ((f.payments || []).reduce((sum, p) => sum + p.amount, 0) + (f.advance || 0));
    if (new Date(f.createdAt) < today) overdueAmount += remaining;
    expectedIn += remaining;
  });
  
  return {
    period: `${days} days`,
    expectedIn,
    overdueAmount,
    netCashflow: expectedIn - overdueAmount,
    alert: overdueAmount > expectedIn * 0.3 ? 'high' : 'normal'
  };
}

// Point 106: Score santé client
export async function scoreClientHealth(clientId) {
  const factures = await Facture.find({ client: clientId });
  
  const totalPaid = factures.filter(f => f.status === 'paid').length;
  const totalOverdue = factures.filter(f => f.status === 'unpaid' && new Date(f.createdAt) < new Date(Date.now() - 30 * 86400000)).length;
  const avgPaymentTime = 30; // Simplified
  
  const score = Math.max(0, 100 - (totalOverdue * 20) - (avgPaymentTime > 45 ? 10 : 0));
  
  return {
    clientId,
    score,
    health: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'medium' : 'poor',
    totalInvoices: factures.length,
    paidCount: totalPaid,
    overdueCount: totalOverdue,
    recommendations: score < 60 ? ['Relance proactive', 'Acompte obligatoire'] : []
  };
}
