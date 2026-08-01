import { createClient } from "@supabase/supabase-js";
import { config } from "../config/environment";

export const supabaseAdmin = createClient(
  config.SUPABASE.url,
  config.SUPABASE.serviceRoleKey
);

// Used BEFORE login (signup, signin, reset password)
export const createSupabaseClient = () => {
  return createClient(
    config.SUPABASE.url,
    config.SUPABASE.anonKey
  );
};

// Used AFTER login (RLS enabled)
export const createSupabaseUserClient = (accessToken: string) => {
  return createClient(
    config.SUPABASE.url,
    config.SUPABASE.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};