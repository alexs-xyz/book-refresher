import type { PublicError, RefresherErrorEnvelope } from '@book-refresher/shared-types';

export function createPublicError(code: string, message: string, retryable = false): PublicError {
  return {
    code,
    message,
    retryable
  };
}

export function createErrorEnvelope(
  requestId: string,
  code: string,
  message: string,
  retryable = false
): RefresherErrorEnvelope {
  return {
    requestId,
    status: 'error',
    mode: null,
    data: null,
    error: createPublicError(code, message, retryable)
  };
}
