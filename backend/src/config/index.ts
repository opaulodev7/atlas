import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'atlas_super_secret_jwt_key_2026_production_grade',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://atlas:atlas@localhost:5432/atlas',
  ai: {
    provider: (process.env.AI_PROVIDER || 'openai').toLowerCase().trim(),
    apiKey: (process.env.AI_API_KEY || '').trim(),
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    timeoutMs: process.env.AI_TIMEOUT_MS ? parseInt(process.env.AI_TIMEOUT_MS, 10) : 15000,
  },
};
