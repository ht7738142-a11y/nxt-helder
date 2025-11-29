import 'dotenv/config';
import { connectDB } from './lib/db.js';
import User from './models/User.js';
import Client from './models/Client.js';
import Devis from './models/Devis.js';
import Facture from './models/Facture.js';
import Chantier from './models/Chantier.js';
import Tache from './models/Tache.js';
import Materiel from './models/Materiel.js';
import Depense from './models/Depense.js';
import Notification from './models/Notification.js';

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Client.deleteMany({}), Devis.deleteMany({}),
    Chantier.deleteMany({}), Tache.deleteMany({}), Materiel.deleteMany({}), Depense.deleteMany({}), Notification.deleteMany({})
  ]);

  const admin = await User.create({ name: 'Admin', email: 'admin@nxt.com', password: 'admin123', role: 'admin' });
  const sales = await User.create({ name: 'Commercial', email: 'sales@nxt.com', password: 'sales123', role: 'commercial' });

  const c1 = await Client.create({ name: 'Dupont SARL', email: 'contact@dupont.fr', phone: '+33 1 23 45 67 89', address: '12 Rue des Fleurs, Paris' });
  const c2 = await Client.create({ name: 'Martin & Co', email: 'info@martin.co', phone: '+33 2 98 76 54 32', address: '5 Avenue du Port, Lyon' });

  const d1 = await Devis.create({
    title: 'Rénovation bureaux', client: c1._id, author: admin._id, currency: 'EUR',
    items: [
      { description: 'Câble électrique', quantity: 50, unit: 'm', unitPrice: 2.5, total: 125 },
      { description: 'Peinture murale', quantity: 30, unit: 'm²', unitPrice: 8, total: 240 },
    ],
    totals: { subtotal: 365, taxRate: 0.21, tax: 76.65, grandTotal: 441.65 }
  });

  const d2 = await Devis.create({
    title: 'Chantier voirie', client: c2._id, author: sales._id, currency: 'EUR',
    items: [
      { description: 'Canalisation', quantity: 1200, unit: 'mm', unitPrice: 0.01, total: 12 },
      { description: 'Granulats', quantity: 1000, unit: 'kg', unitPrice: 0.15, total: 150 },
    ],
    totals: { subtotal: 162, taxRate: 0.21, tax: 34.02, grandTotal: 196.02 }
  });

  const d3 = await Devis.create({
    title: 'Équipements techniques', client: c1._id, author: sales._id, currency: 'EUR',
    items: [
      { description: 'Pompes', quantity: 5, unit: 'pièce', unitPrice: 120, total: 600 },
      { description: 'Tuyaux', quantity: 2500, unit: 'cm', unitPrice: 0.02, total: 50 },
    ],
    totals: { subtotal: 650, taxRate: 0.21, tax: 136.5, grandTotal: 786.5 }
  });

  // Facture depuis d1
  const f1 = await Facture.create({ number: 'F2025-001', devis: d1._id, client: c1._id, totals: d1.totals, currency: d1.currency, payments: [{ amount: 200 }] });

  // Chantiers
  const ch1 = await Chantier.create({ title: 'Chantier A', client: c1._id, address: '12 Rue des Fleurs, Paris', manager: sales._id, status: 'in_progress', progress: 35, costEstimate: 10000, costActual: 3500 })
  const ch2 = await Chantier.create({ title: 'Chantier B', client: c2._id, address: '5 Avenue du Port, Lyon', manager: admin._id, status: 'planned', progress: 0, costEstimate: 20000, costActual: 0 })

  // Tâches
  await Tache.create({ title: 'Pose câbles', chantier: ch1._id, assignedTo: sales._id, type: 'chantier', start: new Date(), end: new Date(Date.now()+86400000), status: 'doing' })
  await Tache.create({ title: 'Réunion client', chantier: ch2._id, assignedTo: admin._id, type: 'reunion', start: new Date(Date.now()+2*86400000), end: new Date(Date.now()+2*86400000+3600000), status: 'todo' })

  // Matériels
  await Materiel.create({ name: 'Câble 3G2.5', sku: 'CB-3G25', quantity: 120, unit: 'm', unitPrice: 1.9, lowStockThreshold: 50 })
  await Materiel.create({ name: 'Peinture blanche', sku: 'PN-BL', quantity: 20, unit: 'L', unitPrice: 8.5, lowStockThreshold: 10 })

  // Dépenses
  await Depense.create({ label: 'Location nacelle', amount: 250, type: 'chantier', chantier: ch1._id, date: new Date() })
  await Depense.create({ label: 'Assurance RC', amount: 120, type: 'general', date: new Date() })

  // Notifications
  await Notification.create({ type: 'task', title: 'Tâche à venir', message: 'Réunion client demain', user: admin._id, dueAt: new Date(Date.now()+86400000) })
  await Notification.create({ type: 'stock', title: 'Stock bas', message: 'Peinture blanche < 10 L', user: null })

  // Historique clients
  c1.history = { devis: [d1._id, d3._id], factures: [f1._id] }
  c2.history = { devis: [d2._id], factures: [] }
  await c1.save(); await c2.save();

  console.log('Seed done:', { admin: admin.email, sales: sales.email, clients: [c1.name,c2.name], devis: [d1.title,d2.title,d3.title], factures: [f1.number], chantiers: [ch1.title, ch2.title] });
  process.exit(0);
}

run().catch((e)=>{ console.error(e); process.exit(1); });
