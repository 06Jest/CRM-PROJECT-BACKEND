import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import orgAdminRoutes from './routes/orgAdmin.routes';
import orgAgentRoutes from './routes/orgAgents.routes';
import contactRoutes from './routes/contacts.routes';
import leadsRoutes from './routes/leads.routes'
import dealsRoutes from './routes/deals.routes';
import aiRoutes from './routes/ai.routes';
import emailRoutes from './routes/email.routes';
import smsRoutes from './routes/sms.routes';

import stripeRoutes from './routes/stripe.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import analyticsRoutes from './routes/analytics.routes';
import agentsRoutes from './routes/orgAgents.routes';

import healthRoutes from './routes/health';


const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json({ limit: '10mb'}));
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/orgadmin', orgAdminRoutes);
app.use('/api/orgagent', orgAgentRoutes);

app.use('/api/leads', leadsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealsRoutes);

app.use('/health', healthRoutes);

app.use('/api/stripe/webhook', express.raw({ type: 'application/json'}));


app.use('/api/ai', aiRoutes);;
app.use('/api/email', emailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentsRoutes);

app.use(errorHandler);
app.use(notFound);


export default app;