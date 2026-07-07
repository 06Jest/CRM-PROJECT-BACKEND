import 'express';
import { AccessTokenPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      superAdminId?: string;
      token?: string;
      user?: AccessTokenPayload;
    }
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

export interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AIDashboardRequest {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  wonRevenue: number;
  recentActivities: number;
  coldContacts: number;
  topCustomer?: string;
}

export interface AIContactRequest {
  contactName: string;
  contactStatus: string;
  daysSinceLastContact: number;
  totalActivities: number;
  activityTypes: Record<string, number>;
  linkedDeals: number;
}

export interface AIDealRequest {
  dealTitle: string;
  dealValue: number;
  dealStage: string;
  daysOpen: number;
  activityCount: number;
  contactName?: string;
}

export interface AIComposeRequest {
  type: 'email' | 'sms';
  contactName: string;
  subject: string;
  tone: 'formal' | 'casual' | 'followup';
  context?: string; 
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  message: string;
  history: AIChatMessage[];
  crmContext?: {
    totalContacts: number;
    totalLeads: number;
    totalDeals: number;
  };
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface SendSmsRequest {
  to: string;
  body: string;
}

export interface SuperAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
  org_id: null;
  is_active: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  user_metadata?: {
    org_id?: string;
  };
  role: string;
}

export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalAdmins: number;
  totalAgents: number;
  totalUsers: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  systemHealth: {
    messageCount: number;
    contactCount: number;
    dealCount: number;
    activityCount: number;
  };
  recentLogins: any[];
  organizationData: any[];
  userGrowth: any[];
  revenueGrowth: any[];
  topOrganizations: any[];
  userDistribution: any[];
}

