import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import contactRoutes from './routes/contacts.routes';
import aiRoutes from './routes/ai.routes';
import emailRoutes from './routes/email.routes';
import smsRoutes from './routes/sms.routes';

import stripeRoutes from './routes/stripe.routes';
import { config } from './config/environment';
import { errorHandler, notFound } from './middleware/error.middleware';
import analyticsRoutes from './routes/analytics.routes';
import agentsRoutes from './routes/agents.routes';

import adminRoutes from './routes/admin.routes';
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
app.use('/api/contacts', contactRoutes);

app.use('/health', healthRoutes);
app.use('/api/admin', adminRoutes);

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