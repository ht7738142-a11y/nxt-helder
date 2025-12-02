import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { connectDB } from './lib/db.js';
import logger from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import devisRoutes from './routes/devis.js';
import factureRoutes from './routes/factures.js';
import devisTemplatesRoutes from './routes/devisTemplates.js';
import chantierRoutes from './routes/chantiers.js';
import tacheRoutes from './routes/taches.js';
import materielRoutes from './routes/materiels.js';
import depenseRoutes from './routes/depenses.js';
import notificationRoutes from './routes/notifications.js';
import healthRoutes from './routes/health.js';
import usersRoutes from './routes/users.js';
import auditRoutes from './routes/audit.js';
import clientsExtRoutes from './routes/clientsExt.js';
import chantiersExtRoutes from './routes/chantiersExt.js';
import materielsExtRoutes from './routes/materielsExt.js';
import facturesExtRoutes from './routes/facturesExt.js';
import calendarRoutes from './routes/calendar.js';
import congesRoutes from './routes/conges.js';
import aiRoutes from './routes/ai.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';
import companiesRoutes from './routes/companies.js';
import workflowRoutes from './routes/workflow.js';
import reportingRoutes from './routes/reporting.js';
import mobileRoutes from './routes/mobile.js';
import portalRoutes from './routes/portal.js';
import aiAdvancedRoutes from './routes/aiAdvanced.js';
import mobileAdvancedRoutes from './routes/mobileAdvanced.js';
import biRoutes from './routes/bi.js';
import graphqlRoutes from './routes/graphql.js';
import cctbRoutes from './routes/cctb.js';
import contactsRoutes from './routes/contacts.js';
import assignmentsRoutes from './routes/assignments.js';
import presencesRoutes from './routes/presences.js';

const app = express();
// CORS simplifié : autoriser toutes les origines (temporaire pour debug)
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);
// Rate limiter désactivé pour le développement
// app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Swagger
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'NXT Hélder API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }]
  },
  apis: [path.join(__dirname, 'routes', '*.js')]
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/devis-templates', devisTemplatesRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/clients-ext', clientsExtRoutes);
app.use('/api/chantiers', chantierRoutes);
app.use('/api/chantiers-ext', chantiersExtRoutes);
app.use('/api/taches', tacheRoutes);
app.use('/api/materiels', materielRoutes);
app.use('/api/materiels-ext', materielsExtRoutes);
app.use('/api/factures-ext', facturesExtRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/conges', congesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/ai-advanced', aiAdvancedRoutes);
app.use('/api/mobile-advanced', mobileAdvancedRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/graphql', graphqlRoutes);
app.use('/api/depenses', depenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cctb', cctbRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/presences', presencesRoutes); // Journal de présences routes

// Quick access: redirect root to Swagger UI
app.get('/', (_req, res) => {
  return res.redirect('/api/docs');
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  logger.info({ msg: 'socket_connected', id: socket.id });
  socket.on('disconnect', () => logger.info({ msg: 'socket_disconnected', id: socket.id }));
});

connectDB()
  .then(() => {
    server.listen(PORT, () => logger.info({ msg: 'server_started', url: `http://localhost:${PORT}` }));
  })
  .catch((err) => {
    logger.error({ msg: 'db_connect_failed', error: err.message });
    process.exit(1);
  });
