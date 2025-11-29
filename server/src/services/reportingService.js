import Facture from '../models/Facture.js';
import Devis from '../models/Devis.js';
import Chantier from '../models/Chantier.js';
import { toCSV } from '../utils/csv.js';

// Point 136-140: Rapports comptables automatiques

// Point 136: Rapport mensuel automatique
export async function generateMonthlyReport(year, month, companyId) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const filter = { 
    createdAt: { $gte: startDate, $lte: endDate }
  };
  if (companyId) filter.company = companyId;
  
  const [factures, devis, chantiers] = await Promise.all([
    Facture.find(filter),
    Devis.find(filter),
    Chantier.find(filter)
  ]);
  
  const caFactures = factures
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
  
  const caDevis = devis
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + (d.totals?.grandTotal || 0), 0);
  
  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    factures: {
      total: factures.length,
      paid: factures.filter(f => f.status === 'paid').length,
      ca: caFactures
    },
    devis: {
      total: devis.length,
      approved: devis.filter(d => d.status === 'approved').length,
      ca: caDevis
    },
    chantiers: {
      total: chantiers.length,
      inProgress: chantiers.filter(c => c.status === 'in_progress').length,
      completed: chantiers.filter(c => c.status === 'completed').length
    }
  };
}

// Point 137: Grand livre comptable
export async function generateGrandLivre(startDate, endDate, companyId) {
  const filter = {
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };
  if (companyId) filter.company = companyId;
  
  const factures = await Facture.find(filter)
    .populate('client', 'name')
    .sort({ createdAt: 1 });
  
  const entries = factures.map(f => ({
    date: f.createdAt.toISOString().split('T')[0],
    type: 'Facture',
    number: f.number || f._id,
    client: f.client?.name || '',
    debit: f.status === 'paid' ? f.totals?.grandTotal || 0 : 0,
    credit: 0,
    balance: f.totals?.grandTotal || 0,
    status: f.status
  }));
  
  return entries;
}

// Point 138: Balance comptable
export async function generateBalance(year, companyId) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  
  const filter = { createdAt: { $gte: startOfYear, $lte: endOfYear } };
  if (companyId) filter.company = companyId;
  
  const [factures, depenses] = await Promise.all([
    Facture.find(filter),
    (await import('../models/Depense.js')).default.find(filter)
  ]);
  
  const totalRevenue = factures
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + (f.totals?.grandTotal || 0), 0);
  
  const totalExpenses = depenses.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const balance = totalRevenue - totalExpenses;
  
  return {
    year,
    revenue: totalRevenue,
    expenses: totalExpenses,
    balance,
    status: balance > 0 ? 'profit' : 'loss'
  };
}

// Point 139: Export format FEC (Fichier Échanges Comptables)
export async function exportFEC(year, companyId) {
  const entries = await generateGrandLivre(`${year}-01-01`, `${year}-12-31`, companyId);
  
  const fecData = entries.map((e, index) => ({
    JournalCode: 'VE', // Ventes
    JournalLib: 'Journal des ventes',
    EcritureNum: index + 1,
    EcritureDate: e.date.replace(/-/g, ''),
    CompteNum: '411000', // Compte clients
    CompteLib: 'Clients',
    CompAuxNum: e.client,
    CompAuxLib: e.client,
    PieceRef: e.number,
    PieceDate: e.date.replace(/-/g, ''),
    EcritureLib: `Facture ${e.number}`,
    Debit: e.debit.toFixed(2),
    Credit: e.credit.toFixed(2),
    EcritureLet: '',
    DateLet: '',
    ValidDate: e.date.replace(/-/g, ''),
    Montantdevise: e.debit.toFixed(2),
    Idevise: 'EUR'
  }));
  
  const headers = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate',
    'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib',
    'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
    'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'
  ];
  
  return toCSV(fecData, headers);
}

// Point 140: Liasse fiscale annuelle
export async function generateLiasseFiscale(year, companyId) {
  const balance = await generateBalance(year, companyId);
  const monthlyReports = [];
  
  for (let month = 1; month <= 12; month++) {
    const report = await generateMonthlyReport(year, month, companyId);
    monthlyReports.push(report);
  }
  
  return {
    year,
    balance,
    monthlyBreakdown: monthlyReports,
    summary: {
      totalCA: monthlyReports.reduce((sum, r) => sum + r.factures.ca, 0),
      totalFactures: monthlyReports.reduce((sum, r) => sum + r.factures.total, 0),
      totalDevis: monthlyReports.reduce((sum, r) => sum + r.devis.total, 0)
    }
  };
}
