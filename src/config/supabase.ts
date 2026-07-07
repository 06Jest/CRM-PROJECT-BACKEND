import { createClient } from "@supabase/supabase-js";
import { config } from "../config/environment";

export const supabaseAdmin = createClient(
  config.SUPABASE.url,
  config.SUPABASE.serviceRoleKey
);

export const createSupabaseClient = () => {
  return createClient(
    config.SUPABASE.url,
    config.SUPABASE.anonKey
  );
};