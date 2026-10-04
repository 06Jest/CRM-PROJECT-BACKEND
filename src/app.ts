import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './features/auth/auth.routes';
import profileRoutes from './features/profiles/profiles.routes';
import onboardingRoutes from './routes/onboarding.routes';
import subscriptionRoutes from './routes/subscription.routes';
import orgRoutes from './routes/organizations.routes';
import orgMembersRoutes from './routes/organizations.members.routes';
import orgInvitesRoutes from './routes/organizations.invites.routes';
import imageKitRoutes from './routes/imagekit.routes';
import contactRoutes from './features/contacts/contacts.routes';
import leadsRoutes from './features/leads/leads.routes';
import dealsRoutes from './features/deals/deals.routes';
import customersRoutes from './features/customers/customers.routes'
import notesRoutes from './features/notes/notes.routes';
import emailRoutes from './features/emails/emails.routes';
import tasksRoutes from './features/tasks/tasks.routes';
import chatsRoutes from './features/chats/chats.routes';
import callsRoutes from './features/calls/calls.routes';
import smsRoutes from './features/sms/sms.routes';
import dashboardRoutes from './routes/dashboard.routes';
import activitiesRoutes from './features/activities/activities.routes'
import aiRoutes from "./ai/routes/ai.routes";
import feedbackRoutes from './routes/feedback.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import archiveRoutes from './routes/archive.routes';
import healthRoutes from './routes/health';
import cookieParser from 'cookie-parser';
import mcpRoutes from './ai/mcp/routes/mcp.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();


app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URLS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/org/members', orgMembersRoutes);
app.use('/api/org/invites', orgInvitesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/imagekit', imageKitRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/chat', chatsRoutes);
app.use('/api/calls', callsRoutes); 
app.use("/api/archives", archiveRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use('/api/health', healthRoutes);
app.use('/api/stripe/webhook', express.raw({ type: 'application/json'}));





app.use('/api/feedback', feedbackRoutes);

app.use(errorHandler);
app.use(notFound);


export default app;
