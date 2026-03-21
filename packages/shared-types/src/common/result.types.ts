import type { PublicError } from './error.types';

export type ApiEnvelope<TData, TMode extends string> = {
  requestId: string;
  status: 'ok' | 'error';
  mode: TMode | null;
  data: TData | null;
  error: PublicError | null;
};
