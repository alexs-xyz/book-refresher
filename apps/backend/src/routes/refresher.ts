import type { FastifyInstance } from 'fastify';

import { refresherRequestSchema, refresherResponseSchema } from '@book-refresher/shared-types';

import { createErrorEnvelope } from '../errors/public-error';
import { RefresherController } from '../services/refresher/refresher-controller';
import { RefresherRequestValidationError } from '../services/refresher/refresher-request-validation-error';

export async function registerRefresherRoute(app: FastifyInstance) {
  const controller = new RefresherController();

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

    try {
      const response = await controller.handle(parsed.data);
      return reply.status(200).send(refresherResponseSchema.parse(response));
    } catch (error) {
      if (error instanceof RefresherRequestValidationError) {
        return reply.status(400).send(
          createErrorEnvelope(parsed.data.requestId, 'REQUEST_INVALID', error.message, false)
        );
      }

      throw error;
    }
  });
}
