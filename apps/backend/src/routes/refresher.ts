import type { FastifyInstance } from 'fastify';

import { refresherRequestSchema, refresherResponseSchema } from '@book-refresher/shared-types';

import { createErrorEnvelope } from '../errors/public-error';
import { RefresherService } from '../services/refresher/refresher-service';

export async function registerRefresherRoute(app: FastifyInstance) {
  const service = new RefresherService();

  app.post('/api/refresher', async (request, reply) => {
    const parsed = refresherRequestSchema.safeParse(request.body);
    const fallbackRequestId =
      typeof request.body === 'object' && request.body !== null && 'requestId' in request.body
        ? String((request.body as { requestId?: unknown }).requestId ?? 'unknown_request')
        : 'unknown_request';

    if (!parsed.success) {
      return reply.status(400).send(
        createErrorEnvelope(
          fallbackRequestId,
          'REQUEST_INVALID',
          'The refresher request did not match the public API contract.',
          false
        )
      );
    }

    const response = await service.run(parsed.data);
    return reply.status(200).send(refresherResponseSchema.parse(response));
  });
}
