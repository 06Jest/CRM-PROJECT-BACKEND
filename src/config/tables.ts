import { config } from "../config/environment";

export const table = {
  refresh: config.SUPABASE.TABLE.refresh_tokens || 'refresh_tokens',
  subscriptions: config.SUPABASE.TABLE.subscriptions || 'subscriptions',
  profile: config.SUPABASE.TABLE.profile || 'profiles',
  org: config.SUPABASE.TABLE.organizations || 'organizations',
  orginvites: config.SUPABASE.TABLE.orginvites || 'organization_invites',
  acceptances: config.SUPABASE.TABLE.acceptances || 'organization_invite_acceptances',
  orgmembers: config.SUPABASE.TABLE.orgmembers || 'organization_members',
  leads: config.SUPABASE.TABLE.leads || 'leads',
  contacts: config.SUPABASE.TABLE.contacts || 'contacts',
  deals: config.SUPABASE.TABLE.deals || 'deals',
  customers: config.SUPABASE.TABLE.customers || 'customers',
  activities: config.SUPABASE.TABLE.activities || 'activities',
  notes: config.SUPABASE.TABLE.notes || 'notes',
  emails: config.SUPABASE.TABLE.emails || 'emails',
  tasks: config.SUPABASE.TABLE.tasks || 'tasks',
  chat: {
    conversations: config.SUPABASE.TABLE.chats.conversations || 'conversations',
    members: config.SUPABASE.TABLE.chats.members || 'conversation_members',
    messages: config.SUPABASE.TABLE.chats.messages || 'messages',
  },
  calls: config.SUPABASE.TABLE.calls || 'calls',
  sms: config.SUPABASE.TABLE.sms || 'sms',
  ai: {
    conversations: config.SUPABASE.TABLE.ai.conversations || 'ai_conversations',
    messages: config.SUPABASE.TABLE.ai.messages || 'ai_messages',
  },
};
