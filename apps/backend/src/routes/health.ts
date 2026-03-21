import type { FastifyInstance } from 'fastify';

import { healthResponseSchema } from '@book-refresher/shared-types';

import type { BackendEnv } from '../config/env';

export async function registerHealthRoute(app: FastifyInstance, env: BackendEnv) {
  app.get('/api/health', async () => {
    return healthResponseSchema.parse({
      status: 'ok',
      service: env.serviceName,
      environment: env.nodeEnv,
      version: env.appVersion
    });
  });
}
