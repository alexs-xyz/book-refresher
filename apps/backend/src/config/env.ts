import { z } from 'zod';

const rawEnvSchema = z.object({
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(8787),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVICE_NAME: z.string().default('book-refresher-backend'),
  APP_VERSION: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173')
});

export type BackendEnv = {
  host: string;
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  serviceName: string;
  appVersion?: string;
  corsOrigins: string[];
};

export function loadEnv(env: NodeJS.ProcessEnv = process.env): BackendEnv {
  const parsed = rawEnvSchema.parse(env);

  return {
    host: parsed.HOST,
    port: parsed.PORT,
    nodeEnv: parsed.NODE_ENV,
    serviceName: parsed.SERVICE_NAME,
    appVersion: parsed.APP_VERSION,
    corsOrigins: parsed.CORS_ORIGINS.split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  };
}
