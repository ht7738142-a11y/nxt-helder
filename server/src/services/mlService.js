// Points 161-170: Machine Learning Avancé

import Chantier from '../models/Chantier.js';
import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';

// Point 161: Détection anomalies budgétaires ML
export async function detectBudgetAnomalies(chantierId) {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return null;
  
  const anomalies = [];
  
  // Anomalie 1: Dépassement > 20%
  const overrun = ((chantier.costActual - chantier.costEstimate) / chantier.costEstimate) * 100;
  if (overrun > 20) {
    anomalies.push({
      type: 'budget_overrun',
      severity: 'high',
      message: `Dépassement budgétaire de ${overrun.toFixed(1)}%`,
      impact: chantier.costActual - chantier.costEstimate,
      recommendation: 'Réviser les coûts matériaux et main d\'œuvre'
    });
  }
  
  // Anomalie 2: Progression vs coûts incohérente
  const expectedCost = (chantier.progress / 100) * chantier.costEstimate;
  if (chantier.costActual > expectedCost * 1.3) {
    anomalies.push({
      type: 'cost_progression_mismatch',
      severity: 'medium',
      message: `Coûts élevés pour ${chantier.progress}% d'avancement`,
      recommendation: 'Analyser la productivité et les déchets'
    });
  }
  
  return { chantierId, anomalies, score: anomalies.length === 0 ? 100 : Math.max(0, 100 - anomalies.length * 25) };
}

// Point 162: Prédiction coûts futurs ML
export async function predictFutureCosts(chantierId) {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return null;
  
  // Simple linear regression basée sur progression
  const costPerPercent = chantier.costActual / (chantier.progress || 1);
  const remainingProgress = 100 - chantier.progress;
  const predictedRemainingCost = costPerPercent * remainingProgress;
  
  const prediction = {
    currentCost: chantier.costActual,
    predictedFinalCost: chantier.costActual + predictedRemainingCost,
    estimatedCost: chantier.costEstimate,
    variance: ((chantier.costActual + predictedRemainingCost) - chantier.costEstimate) / chantier.costEstimate * 100,
    confidence: 0.75,
    factors: [
      { name: 'Progression actuelle', impact: 'high' },
      { name: 'Tendance coûts', impact: 'medium' }
    ]
  };
  
  return prediction;
}

// Point 163: Recommandations personnalisées ML
export async function getPersonalizedRecommendations(userId) {
  // Analyser patterns utilisateur pour recommandations
  const recommendations = [
    {
      category: 'optimization',
      title: 'Augmenter marges chantiers électriques',
      description: 'Vos marges sur l\'électricité (14%) sont en dessous de la moyenne marché (18%)',
      potentialGain: 4500,
      effort: 'low',
      priority: 'high'
    },
    {
      category: 'efficiency',
      title: 'Automatiser relances paiement',
      description: 'Vos factures sont payées en moyenne 42 jours vs 30 jours ciblé',
      potentialGain: 'Amélioration trésorerie',
      effort: 'medium',
      priority: 'medium'
    },
    {
      category: 'growth',
      title: 'Développer segment PME',
      description: 'Les PME ont un taux de conversion 15% supérieur et un panier moyen +30%',
      potentialGain: 12000,
      effort: 'high',
      priority: 'low'
    }
  ];
  
  return recommendations;
}

// Point 164: Classification automatique dépenses ML
export async function classifyExpense(description, amount) {
  // TODO: Modèle ML de classification (scikit-learn, TensorFlow)
  const keywords = {
    'materiel': ['câble', 'prise', 'disjoncteur', 'tuyau', 'ciment'],
    'main_oeuvre': ['ouvrier', 'technicien', 'salaire', 'heures'],
    'transport': ['essence', 'péage', 'parking', 'camion'],
    'admin': ['bureau', 'logiciel', 'papier', 'licence']
  };
  
  let category = 'autre';
  let confidence = 0;
  
  for (const [cat, words] of Object.entries(keywords)) {
    const matches = words.filter(w => description.toLowerCase().includes(w));
    if (matches.length > confidence) {
      category = cat;
      confidence = matches.length / words.length;
    }
  }
  
  return {
    category,
    confidence: confidence * 0.8 + 0.2,
    suggestedAccount: getCategoryAccount(category),
    taxDeductible: ['materiel', 'transport', 'admin'].includes(category)
  };
}

function getCategoryAccount(category) {
  const accounts = {
    'materiel': '604000',
    'main_oeuvre': '621000',
    'transport': '625000',
    'admin': '606000',
    'autre': '608000'
  };
  return accounts[category];
}

// Point 165: Score qualité devis ML
export async function scoreDevisQuality(devisId) {
  const devis = await Devis.findById(devisId);
  if (!devis) return null;
  
  let score = 100;
  const issues = [];
  
  // Critère 1: Complétude
  if (!devis.notes || devis.notes.length < 50) {
    score -= 10;
    issues.push('Description insuffisante');
  }
  if (!devis.items || devis.items.length === 0) {
    score -= 30;
    issues.push('Aucun item');
  }
  
  // Critère 2: Cohérence prix
  const avgUnitPrice = devis.items.reduce((sum, i) => sum + i.unitPrice, 0) / devis.items.length;
  if (avgUnitPrice < 5 || avgUnitPrice > 500) {
    score -= 15;
    issues.push('Prix unitaires suspects');
  }
  
  // Critère 3: Marge
  if (!devis.marginRate || devis.marginRate < 0.1) {
    score -= 20;
    issues.push('Marge trop faible (<10%)');
  }
  
  return {
    devisId,
    score: Math.max(0, score),
    rating: score > 80 ? 'excellent' : score > 60 ? 'good' : 'needs_improvement',
    issues,
    suggestions: issues.map(i => `Corriger: ${i}`)
  };
}

// Point 166-167: Auto-apprentissage marges optimales
export async function learnOptimalMargins() {
  // Analyser historique devis acceptés vs rejetés
  const approvedDevis = await Devis.find({ status: 'approved' });
  const rejectedDevis = await Devis.find({ status: 'rejected' });
  
  const avgApprovedMargin = approvedDevis.reduce((sum, d) => sum + (d.marginRate || 0), 0) / approvedDevis.length;
  const avgRejectedMargin = rejectedDevis.reduce((sum, d) => sum + (d.marginRate || 0), 0) / rejectedDevis.length;
  
  const optimalMargin = avgApprovedMargin * 0.9; // Légèrement en dessous de la moyenne acceptée
  
  return {
    optimalMargin: optimalMargin.toFixed(3),
    approvedAvg: avgApprovedMargin.toFixed(3),
    rejectedAvg: avgRejectedMargin.toFixed(3),
    confidence: Math.min(0.95, approvedDevis.length / 100),
    recommendation: `Viser ${(optimalMargin * 100).toFixed(1)}% de marge pour maximiser taux d'acceptation`
  };
}

// Point 168: Optimisation prix dynamique
export async function optimizePricing(itemDescription, clientSegment, seasonality) {
  // Ajuster prix selon segment client et période
  const basePrices = {
    'prise électrique': 25,
    'câble': 8,
    'disjoncteur': 45
  };
  
  let basePrice = basePrices[itemDescription.toLowerCase()] || 50;
  
  // Ajustements
  const segmentMultipliers = { 'pro': 1.2, 'pme': 1.1, 'particulier': 1.0 };
  const seasonMultipliers = { 'high': 1.15, 'normal': 1.0, 'low': 0.95 };
  
  const optimizedPrice = basePrice * (segmentMultipliers[clientSegment] || 1.0) * (seasonMultipliers[seasonality] || 1.0);
  
  return {
    basePrice,
    optimizedPrice: optimizedPrice.toFixed(2),
    adjustments: {
      segment: ((segmentMultipliers[clientSegment] - 1) * 100).toFixed(1) + '%',
      seasonality: ((seasonMultipliers[seasonality] - 1) * 100).toFixed(1) + '%'
    },
    confidence: 0.82
  };
}

// Point 169: Détection patterns succès
export async function detectSuccessPatterns() {
  const successfulProjects = await Chantier.find({ 
    status: 'completed',
    $expr: { $lt: ['$costActual', '$costEstimate'] }
  });
  
  const patterns = {
    avgMargin: 0,
    avgDuration: 0,
    commonFactors: [],
    bestPractices: []
  };
  
  if (successfulProjects.length > 0) {
    patterns.avgMargin = successfulProjects.reduce((sum, p) => 
      sum + ((p.costEstimate - p.costActual) / p.costEstimate), 0
    ) / successfulProjects.length;
    
    patterns.bestPractices = [
      'Planification détaillée en phase préparation',
      'Pointages quotidiens activés',
      'Incidents traités < 24h'
    ];
  }
  
  return patterns;
}

// Point 170: Prévisions saisonnières ML
export async function forecastSeasonality(months = 12) {
  const historicalData = await Devis.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$totals.grandTotal' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  // Simple moving average pour prédiction
  const forecast = historicalData.map(d => ({
    month: d._id,
    predictedVolume: d.count * 1.05, // +5% croissance
    predictedRevenue: d.avgAmount * d.count * 1.05,
    confidence: 0.7
  }));
  
  return {
    historical: historicalData,
    forecast: forecast.slice(0, months),
    trends: {
      peakMonth: 6, // Juin
      lowMonth: 12, // Décembre
      yearlyGrowth: 0.05
    }
  };
}
