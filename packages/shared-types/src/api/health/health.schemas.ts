import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string().min(1),
  environment: z.string().optional(),
  version: z.string().optional()
});
