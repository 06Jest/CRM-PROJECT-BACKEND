import { createClient } from '@supabase/supabase-js';
import { config } from '../config/environment';

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// Regular Client (for user-scoped operations)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

console.log('✅ Supabase clients initialized');