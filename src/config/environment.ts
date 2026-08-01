import dotenv from 'dotenv';
import type { StringValue } from "ms";

dotenv.config();

export const config = {

  SUPABASE: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    TABLE: {
      refresh_tokens: process.env.TABLE_REFRESH_TOKENS,
      profile: process.env.TABLE_PROFILES ,
      organizations: process.env.TABLE_ORGANIZATIONS,
      leads: process.env.TABLE_LEADS,
      contacts: process.env.TABLE_CONTACTS,
      deals: process.env.TABLE_DEALS,
      customers: process.env.TABLE_CUSTOMERS,
      activities: process.env.TABLE_ACTIVITIES,
      notes: process.env.TABLE_NOTES,
      emails: process.env.TABLE_EMAILS,
      tasks: process.env.TABLE_TASKS,
      chats: {
        conversations: process.env.TABLE_CHATS_CONVERSATIONS,
        members: process.env.TABLE_CHATS_MEMBERS,
        messages: process.env.TABLE_CHATS_MESSAGES,
      },
      calls:process.env.TABLE_CALLS,
      sms:process.env.TABLE_SMS,
    },
  },


  APP: {
    port: Number(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  JWT: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expire: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as StringValue,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expire: Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30,
      reuse: Number(process.env.JWT_REFRESH_REUSE_SECONDS) || 10,
    }
  },

  EMAIL: {
      resend: {
        key: process.env.RESEND_API_KEY,
      } 
  }
};


const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_JWT_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_DAYS',
  'JWT_REFRESH_REUSE_SECONDS',
  'RESEND_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}