import type { z } from 'zod';

import { healthResponseSchema } from './health.schemas';

export type HealthResponse = z.infer<typeof healthResponseSchema>;
