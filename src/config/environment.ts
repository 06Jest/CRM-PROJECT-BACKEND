import dotenv from 'dotenv';

dotenv.config();

export const config = {

  SUPABASE: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  APP: {
    port: Number(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  JWT: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expire: Number(process.env.JWT_ACCESS_EXPIRES) || '15',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expire: Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || '30',
      reuse: Number(process.env.JWT_REFRESH_REUSE_SECONDS) || '10',
    }
  }
};


const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_DAYS',
  'JWT_REFRESH_REUSE_SECONDS'
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}