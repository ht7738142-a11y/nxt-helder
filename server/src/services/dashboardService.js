import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';
import Client from '../models/Client.js';
import User from '../models/User.js';

// Point 113: Dashboard direction complet
export async function getDirectionDashboard() {
  const [
    totalClients,
    totalDevis,
    totalFactures,
    totalChantiers,
    devisStats,
    facturesStats,
    chantiersStats,
    recentActivity
  ] = await Promise.all([
    Client.countDocuments({ archived: false }),
    Devis.countDocuments(),
    Facture.countDocuments(),
    Chantier.countDocuments(),
    Devis.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totals.grandTotal' } } }
    ]),
    Facture.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totals.grandTotal' } } }
    ]),
    Chantier.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
    ]),
    Devis.find().sort({ createdAt: -1 }).limit(10).populate('client', 'name')
  ]);

  const caMonth = await Facture.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setDate(1)) },
        status: { $in: ['paid', 'partial'] }
      }
    },
    { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
  ]);

  return {
    overview: {
      clients: totalClients,
      devis: totalDevis,
      factures: totalFactures,
      chantiers: totalChantiers
    },
    devis: { byStatus: devisStats },
    factures: { byStatus: facturesStats },
    chantiers: { byStatus: chantiersStats },
    caMonth: caMonth[0]?.total || 0,
    recentActivity: recentActivity.map(d => ({
      id: d._id,
      title: d.title,
      client: d.client?.name,
      status: d.status,
      date: d.createdAt
    }))
  };
}

// Point 114: Dashboard commercial
export async function getCommercialDashboard(userId) {
  const [myDevis, myClients] = await Promise.all([
    Devis.find({ author: userId }).sort({ createdAt: -1 }).limit(20).populate('client', 'name'),
    Client.find({ 'history.interactions.user': userId }).limit(50)
  ]);

  const pipeline = myDevis.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  return {
    myDevis: myDevis.length,
    myClients: myClients.length,
    pipeline,
    recentDevis: myDevis.slice(0, 5)
  };
}

// Point 115: Dashboard chef chantier
export async function getChefChantierDashboard(userId) {
  const myChantiers = await Chantier.find({ manager: userId })
    .populate('client', 'name')
    .sort({ createdAt: -1 });

  const stats = {
    total: myChantiers.length,
    inProgress: myChantiers.filter(c => c.status === 'in_progress').length,
    delayed: myChantiers.filter(c => c.endDate && new Date() > c.endDate && c.status !== 'completed').length,
    avgProgress: myChantiers.reduce((sum, c) => sum + c.progress, 0) / (myChantiers.length || 1)
  };

  return {
    stats,
    chantiers: myChantiers.map(c => ({
      id: c._id,
      title: c.title,
      client: c.client?.name,
      progress: c.progress,
      status: c.status,
      budget: { estimate: c.costEstimate, actual: c.costActual }
    }))
  };
}

// Point 116: KPIs globaux entreprise
export async function getGlobalKPIs() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  
  const [caYear, factures, chantiers] = await Promise.all([
    Facture.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
    ]),
    Facture.find({ createdAt: { $gte: startOfYear } }),
    Chantier.find({ createdAt: { $gte: startOfYear } })
  ]);

  const paidCount = factures.filter(f => f.status === 'paid').length;
  const paymentRate = factures.length > 0 ? (paidCount / factures.length) * 100 : 0;
  
  const avgMargin = chantiers.length > 0
    ? chantiers.reduce((sum, c) => sum + ((c.costEstimate - c.costActual) / (c.costEstimate || 1)), 0) / chantiers.length * 100
    : 0;

  return {
    caYear: caYear[0]?.total || 0,
    paymentRate: paymentRate.toFixed(1),
    avgMargin: avgMargin.toFixed(1),
    activeChantiers: chantiers.filter(c => c.status === 'in_progress').length,
    totalEmployees: await User.countDocuments()
  };
}
