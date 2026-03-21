import { z } from 'zod';

export const publicErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  retryable: z.boolean()
});
