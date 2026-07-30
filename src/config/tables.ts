import { config } from "../config/environment";

export const table = {
  refresh: config.SUPABASE.TABLE.refresh_tokens || 'refresh_tokens',
  profile: config.SUPABASE.TABLE.profile || 'profiles',
  org: config.SUPABASE.TABLE.organizations || 'organizations',
  leads: config.SUPABASE.TABLE.leads || 'leads',
  contacts: config.SUPABASE.TABLE.contacts || 'contacts',
  deals: config.SUPABASE.TABLE.deals || 'deals',
  customers: config.SUPABASE.TABLE.customers || 'customers',
  notes: config.SUPABASE.TABLE.notes || 'notes',
  emails: config.SUPABASE.TABLE.emails || 'emails',
  tasks: config.SUPABASE.TABLE.tasks || 'tasks',
  chat: {
    conversations: config.SUPABASE.TABLE.chats.conversations || 'conversations',
    members: config.SUPABASE.TABLE.chats.members || 'conversation_members',
    messages: config.SUPABASE.TABLE.chats.messages || 'messages',
  }
};
