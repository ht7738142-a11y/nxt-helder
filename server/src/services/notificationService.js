import Notification from '../models/Notification.js';
import Facture from '../models/Facture.js';
import Chantier from '../models/Chantier.js';
import Conge from '../models/Conge.js';

// Point 117: Notifications intelligentes contextuelles
export async function createSmartNotification(type, data, userId) {
  const notification = {
    user: userId,
    type,
    title: '',
    message: '',
    priority: 'normal',
    ...data
  };

  switch (type) {
    case 'invoice_overdue':
      notification.title = 'Facture impayée';
      notification.message = `La facture ${data.invoiceNumber} est en retard de ${data.daysOverdue} jours`;
      notification.priority = data.daysOverdue > 30 ? 'high' : 'normal';
      break;
    case 'chantier_delayed':
      notification.title = 'Chantier en retard';
      notification.message = `Le chantier "${data.chantierTitle}" accuse un retard de ${data.daysDelayed} jours`;
      notification.priority = 'high';
      break;
    case 'low_stock':
      notification.title = 'Stock bas';
      notification.message = `Le matériel "${data.materielName}" est en dessous du seuil (${data.quantity} restant)`;
      notification.priority = 'medium';
      break;
    case 'conge_request':
      notification.title = 'Demande de congé';
      notification.message = `${data.userName} demande un congé du ${data.startDate} au ${data.endDate}`;
      notification.priority = 'normal';
      break;
    case 'payment_received':
      notification.title = 'Paiement reçu';
      notification.message = `Paiement de ${data.amount}€ reçu pour facture ${data.invoiceNumber}`;
      notification.priority = 'low';
      break;
  }

  return Notification.create(notification);
}

// Point 118: Alertes automatiques
export async function checkAndCreateAlerts() {
  const alerts = [];

  // Factures en retard > 30 jours
  const overdueInvoices = await Facture.find({
    status: 'unpaid',
    createdAt: { $lt: new Date(Date.now() - 30 * 86400000) }
  }).populate('client', 'name');

  for (const inv of overdueInvoices) {
    alerts.push({
      type: 'invoice_overdue',
      severity: 'high',
      message: `Facture ${inv.number} client ${inv.client?.name} en retard`,
      data: { invoice: inv._id }
    });
  }

  // Chantiers en retard
  const delayedChantiers = await Chantier.find({
    status: { $in: ['in_progress', 'planned'] },
    endDate: { $lt: new Date() }
  });

  for (const ch of delayedChantiers) {
    alerts.push({
      type: 'chantier_delayed',
      severity: 'high',
      message: `Chantier ${ch.title} dépasse la date prévue`,
      data: { chantier: ch._id }
    });
  }

  // Congés en attente > 7 jours
  const pendingConges = await Conge.find({
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 7 * 86400000) }
  }).populate('user', 'name');

  for (const conge of pendingConges) {
    alerts.push({
      type: 'conge_pending',
      severity: 'medium',
      message: `Demande de congé de ${conge.user?.name} en attente depuis > 7j`,
      data: { conge: conge._id }
    });
  }

  return alerts;
}

// Point 119: Rappels automatiques
export async function scheduleReminders() {
  const reminders = [];

  // Rappel facturation devis approuvés non facturés
  const approvedDevis = await (await import('../models/Devis.js')).default.find({
    status: 'approved',
    createdAt: { $lt: new Date(Date.now() - 7 * 86400000) }
  });

  for (const devis of approvedDevis) {
    // Check if facture exists
    const facture = await Facture.findOne({ devis: devis._id });
    if (!facture) {
      reminders.push({
        type: 'reminder',
        action: 'create_invoice',
        message: `Devis ${devis.title} approuvé depuis > 7j sans facture`,
        data: { devis: devis._id }
      });
    }
  }

  return reminders;
}

// Point 120: Digest quotidien
export async function generateDailyDigest(userId, role) {
  const digest = {
    date: new Date(),
    user: userId,
    role,
    sections: []
  };

  // Stats du jour
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newDevis, newFactures, tasksToday] = await Promise.all([
    (await import('../models/Devis.js')).default.countDocuments({ createdAt: { $gte: today } }),
    Facture.countDocuments({ createdAt: { $gte: today } }),
    (await import('../models/Tache.js')).default.countDocuments({ start: { $gte: today, $lt: new Date(today.getTime() + 86400000) } })
  ]);

  digest.sections.push({
    title: 'Activité du jour',
    stats: { newDevis, newFactures, tasksToday }
  });

  // Alertes
  const alerts = await checkAndCreateAlerts();
  if (alerts.length > 0) {
    digest.sections.push({
      title: 'Alertes',
      items: alerts.slice(0, 5)
    });
  }

  // Tâches prioritaires
  const urgentTasks = await (await import('../models/Tache.js')).default
    .find({ assignedTo: userId, status: { $ne: 'completed' }, priority: 'urgent' })
    .limit(5);

  if (urgentTasks.length > 0) {
    digest.sections.push({
      title: 'Tâches urgentes',
      items: urgentTasks
    });
  }

  return digest;
}
