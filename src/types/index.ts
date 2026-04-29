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
  role: 'user' | 'assistat';
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
