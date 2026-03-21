import Fastify from 'fastify';
import cors from '@fastify/cors';

import { loadEnv, type BackendEnv } from './config/env';
import { createOriginChecker } from './lib/cors';
import { registerHealthRoute } from './routes/health';
import { registerRefresherRoute } from './routes/refresher';

export async function buildApp(partialEnv?: Partial<NodeJS.ProcessEnv>) {
  const env: BackendEnv = loadEnv({ ...process.env, ...partialEnv });
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: createOriginChecker(env.corsOrigins)
  });

  await registerHealthRoute(app, env);
  await registerRefresherRoute(app);

  return { app, env };
}
