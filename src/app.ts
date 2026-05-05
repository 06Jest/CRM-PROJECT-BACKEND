import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import aiRoutes from './routes/ai.routes';
import emailRoutes from './routes/email.routes';
import smsRoutes from './routes/sms.routes';
import stripeRoutes from './routes/stripe.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import analyticsRoutes from './routes/analytics.routes';
import agentsRoutes from './routes/agents.routes';


const app = express();;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));
app.use('/api/stripe/webhook', express.raw({ type: 'application/json'}));
app.use(express.json({ limit: '10mb'}));
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.use('/api/ai', aiRoutes);;
app.use('/api/email', emailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;