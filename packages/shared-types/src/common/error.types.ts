import type { z } from 'zod';

import { publicErrorSchema } from './error.schemas';

export type PublicError = z.infer<typeof publicErrorSchema>;
