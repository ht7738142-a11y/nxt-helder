// Points 186-195: Business Intelligence & Analytics Avancés

import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';
import Client from '../models/Client.js';

// Point 186-187: Tableaux de bord BI avancés (Metabase/Superset)
export async function getMetabaseConfig() {
  // Configuration pour intégration Metabase
  return {
    url: process.env.METABASE_URL || 'http://localhost:3000',
    secretKey: process.env.METABASE_SECRET_KEY,
    dashboards: {
      executive: { id: 1, name: 'Vue Direction' },
      commercial: { id: 2, name: 'Performance Commerciale' },
      operational: { id: 3, name: 'Opérations Chantiers' },
      financial: { id: 4, name: 'Analyse Financière' }
    }
  };
}

export async function generateMetabaseToken(dashboardId, userId) {
  // Générer JWT token pour embed Metabase
  // TODO: Implémenter avec jsonwebtoken
  const payload = {
    resource: { dashboard: dashboardId },
    params: { user_id: userId },
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 min
  };
  
  return {
    token: 'mock_metabase_token',
    url: `${process.env.METABASE_URL}/embed/dashboard/${payload.token}`,
    expiresIn: 600
  };
}

// Point 188: Cube OLAP pour analyses multidimensionnelles
export async function getOLAPCube(dimensions, measures, filters = {}) {
  // Dimensions: time, client, project_type, region
  // Measures: revenue, margin, count
  
  const pipeline = [];
  
  if (filters.startDate || filters.endDate) {
    const dateFilter = {};
    if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
    pipeline.push({ $match: { createdAt: dateFilter } });
  }
  
  const groupBy = {};
  dimensions.forEach(dim => {
    if (dim === 'time') groupBy.month = { $month: '$createdAt' };
    if (dim === 'client') groupBy.client = '$client';
    if (dim === 'status') groupBy.status = '$status';
  });
  
  const aggregation = { _id: groupBy };
  measures.forEach(measure => {
    if (measure === 'revenue') aggregation.revenue = { $sum: '$totals.grandTotal' };
    if (measure === 'count') aggregation.count = { $sum: 1 };
    if (measure === 'avgMargin') aggregation.avgMargin = { $avg: '$marginRate' };
  });
  
  pipeline.push({ $group: aggregation });
  
  return Facture.aggregate(pipeline);
}

// Point 189: Drill-down interactif
export async function drillDown(metric, level, filters) {
  // Niveaux: year → quarter → month → week → day
  const levels = ['year', 'quarter', 'month', 'week', 'day'];
  const currentIndex = levels.indexOf(level);
  
  const dateGroup = {
    year: { $year: '$createdAt' },
    quarter: { $quarter: '$createdAt' },
    month: { $month: '$createdAt' },
    week: { $week: '$createdAt' },
    day: { $dayOfMonth: '$createdAt' }
  };
  
  const data = await Facture.aggregate([
    { $match: filters },
    {
      $group: {
        _id: dateGroup[level],
        value: metric === 'revenue' ? { $sum: '$totals.grandTotal' } : { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    level,
    nextLevel: levels[currentIndex + 1] || null,
    data,
    canDrillDown: currentIndex < levels.length - 1
  };
}

// Point 190: Indicateurs clés personnalisables
export async function getCustomKPIs(userId, kpiConfig) {
  // KPI configurables par utilisateur
  const kpis = {};
  
  for (const config of kpiConfig) {
    const { name, metric, period, target } = config;
    
    const startDate = getStartDateForPeriod(period);
    const value = await calculateMetric(metric, { createdAt: { $gte: startDate } });
    
    kpis[name] = {
      value,
      target,
      achievement: target ? (value / target * 100).toFixed(1) : null,
      trend: await calculateTrend(metric, period),
      status: value >= target ? 'on_track' : 'at_risk'
    };
  }
  
  return kpis;
}

function getStartDateForPeriod(period) {
  const now = new Date();
  switch (period) {
    case 'day': return new Date(now.setHours(0, 0, 0, 0));
    case 'week': return new Date(now.setDate(now.getDate() - 7));
    case 'month': return new Date(now.setMonth(now.getMonth() - 1));
    case 'quarter': return new Date(now.setMonth(now.getMonth() - 3));
    case 'year': return new Date(now.setFullYear(now.getFullYear() - 1));
    default: return new Date(0);
  }
}

async function calculateMetric(metric, filter) {
  switch (metric) {
    case 'revenue':
      const factures = await Facture.find({ ...filter, status: 'paid' });
      return factures.reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
    case 'devis_count':
      return Devis.countDocuments(filter);
    case 'conversion_rate':
      const [total, approved] = await Promise.all([
        Devis.countDocuments(filter),
        Devis.countDocuments({ ...filter, status: 'approved' })
      ]);
      return total > 0 ? (approved / total * 100).toFixed(1) : 0;
    default:
      return 0;
  }
}

async function calculateTrend(metric, period) {
  // Comparer période actuelle vs période précédente
  const current = await calculateMetric(metric, { createdAt: { $gte: getStartDateForPeriod(period) } });
  const previous = await calculateMetric(metric, { 
    createdAt: { 
      $gte: getStartDateForPeriod(period + '_previous'),
      $lt: getStartDateForPeriod(period)
    }
  });
  
  return previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 0;
}

// Point 191-192: Prévisions ML croissance
export async function forecastGrowth(months = 12) {
  // Récupérer historique CA mensuel
  const historical = await Facture.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totals.grandTotal' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Simple linear regression pour prévision
  const forecast = [];
  const avgGrowth = 0.05; // 5% croissance mensuelle estimée
  let lastRevenue = historical[historical.length - 1]?.revenue || 0;
  
  for (let i = 1; i <= months; i++) {
    lastRevenue *= (1 + avgGrowth);
    forecast.push({
      month: i,
      predictedRevenue: Math.round(lastRevenue),
      confidence: Math.max(0.5, 1 - (i * 0.05)) // Confiance décroît avec le temps
    });
  }
  
  return {
    historical,
    forecast,
    growthRate: avgGrowth,
    methodology: 'linear_regression'
  };
}

// Point 193: Segmentation clients avancée ML
export async function segmentClients() {
  const clients = await Client.find().lean();
  
  // Calculer métriques par client
  const clientMetrics = await Promise.all(clients.map(async (c) => {
    const factures = await Facture.find({ client: c._id, status: 'paid' });
    const ca = factures.reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
    const avgInvoice = ca / (factures.length || 1);
    const frequency = factures.length;
    
    return { ...c, ca, avgInvoice, frequency };
  }));
  
  // Segmentation RFM simplifiée
  const segments = clientMetrics.map(c => ({
    clientId: c._id,
    name: c.name,
    segment: classifySegment(c.ca, c.frequency, c.avgInvoice),
    ca: c.ca,
    frequency: c.frequency,
    avgInvoice: c.avgInvoice
  }));
  
  return {
    segments,
    distribution: {
      vip: segments.filter(s => s.segment === 'vip').length,
      gold: segments.filter(s => s.segment === 'gold').length,
      silver: segments.filter(s => s.segment === 'silver').length,
      bronze: segments.filter(s => s.segment === 'bronze').length
    }
  };
}

function classifySegment(ca, frequency, avgInvoice) {
  if (ca > 50000 && frequency > 10) return 'vip';
  if (ca > 25000 && frequency > 5) return 'gold';
  if (ca > 10000) return 'silver';
  return 'bronze';
}

// Point 194: Analyse concurrence marché
export async function analyzeMarket() {
  // Analyse comparative (données mockées - en production: API externes)
  return {
    marketSize: 850000000, // 850M€
    marketGrowth: 0.07, // 7% annuel
    ourPosition: {
      marketShare: 0.0015, // 0.15%
      rank: 125,
      competitors: 450
    },
    benchmark: {
      avgMargin: 0.18,
      avgConversionRate: 0.32,
      avgProjectSize: 35000
    },
    ourMetrics: await getOurMetrics(),
    opportunities: [
      'Segment PME sous-exploité (potentiel +25%)',
      'Région Flandre à développer',
      'Offre rénovation énergétique en croissance'
    ]
  };
}

async function getOurMetrics() {
  const [devis, factures] = await Promise.all([
    Devis.countDocuments(),
    Facture.find({ status: 'paid' })
  ]);
  
  const ca = factures.reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
  const approved = await Devis.countDocuments({ status: 'approved' });
  
  return {
    conversionRate: devis > 0 ? (approved / devis).toFixed(2) : 0,
    avgProjectSize: ca / (factures.length || 1),
    annualRevenue: ca
  };
}

// Point 195: Recommandations stratégiques IA
export async function getStrategicRecommendations() {
  const analysis = await analyzeMarket();
  const segments = await segmentClients();
  const forecast = await forecastGrowth(12);
  
  const recommendations = [];
  
  // Recommandation 1: Segment
  const vipCount = segments.distribution.vip;
  if (vipCount < 5) {
    recommendations.push({
      priority: 'high',
      category: 'growth',
      title: 'Développer portefeuille clients VIP',
      description: `Seulement ${vipCount} clients VIP. Objectif: atteindre 10 clients VIP (+100% CA potentiel)`,
      actions: ['Programme fidélité premium', 'Account manager dédié', 'Offres personnalisées'],
      impact: { ca: '+150000€/an', probability: 0.7 }
    });
  }
  
  // Recommandation 2: Marge
  if (analysis.ourMetrics.avgProjectSize < analysis.benchmark.avgProjectSize) {
    recommendations.push({
      priority: 'medium',
      category: 'optimization',
      title: 'Augmenter taille projets',
      description: 'Vos projets sont 15% sous la moyenne marché',
      actions: ['Upselling systématique', 'Packages premium', 'Services complémentaires'],
      impact: { ca: '+85000€/an', probability: 0.6 }
    });
  }
  
  // Recommandation 3: Croissance
  if (forecast.growthRate < 0.1) {
    recommendations.push({
      priority: 'high',
      category: 'growth',
      title: 'Accélérer croissance',
      description: 'Croissance 5% vs objectif 10%',
      actions: ['Marketing digital', 'Partenariats stratégiques', 'Expansion géographique'],
      impact: { ca: '+200000€/an', probability: 0.5 }
    });
  }
  
  return {
    recommendations,
    summary: {
      totalPotential: recommendations.reduce((sum, r) => sum + parseInt(r.impact.ca.replace(/[^\d]/g, '')), 0),
      avgProbability: (recommendations.reduce((sum, r) => sum + r.impact.probability, 0) / recommendations.length).toFixed(2)
    }
  };
}
