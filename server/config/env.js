import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  cookieName: process.env.JWT_COOKIE_NAME ?? 'cspms_token',
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME ?? 'System Admin',
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@cspms.local',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123',
  defaultTrainerName: process.env.DEFAULT_TRAINER_NAME ?? 'Lead Trainer',
  defaultTrainerEmail: process.env.DEFAULT_TRAINER_EMAIL ?? 'trainer@cspms.local',
  defaultTrainerPassword: process.env.DEFAULT_TRAINER_PASSWORD ?? 'Trainer@123',
};

export const validateEnv = () => {
  const missing = [];

  if (!env.mongoUri) {
    missing.push('MONGO_URI');
  }

  if (!env.jwtSecret) {
    missing.push('JWT_SECRET');
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return env;
};

export default env;
