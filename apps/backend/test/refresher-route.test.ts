import type { RefresherRequest } from '@book-refresher/shared-types';

import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app';

const LONG_PREFIX_TEXT = 'Earlier mention of Darcy in the drawing room. '.repeat(25);

const createRequest = (overrides: Partial<RefresherRequest> = {}): RefresherRequest => ({
  requestId: 'request-123',
  documentId: 'doc-1',
  selectedText: 'Darcy',
  selectedPage: 10,
  localContext: 'Elizabeth looked at Darcy and then turned away.',
  prefixText: LONG_PREFIX_TEXT,
  documentMeta: {
    fileName: 'novel.pdf',
    pageCount: 200
  },
  ...overrides
});

describe('POST /api/refresher', () => {
  it('returns a typed normal response envelope for a valid request', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: createRequest()
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        requestId: 'request-123',
        status: 'ok',
        mode: 'normal',
        data: {
          resolvedName: 'Darcy'
        },
        error: null
      });
    } finally {
      await app.close();
    }
  });

  it('returns ambiguous mode without treating it as an error', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: createRequest({ selectedText: 'Tom' })
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        requestId: 'request-123',
        status: 'ok',
        mode: 'ambiguous',
        data: {
          selectedText: 'Tom'
        },
        error: null
      });
    } finally {
      await app.close();
    }
  });

  it('returns sparse mode for limited prefix evidence', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: createRequest({ prefixText: 'Brief earlier mention.' })
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        requestId: 'request-123',
        status: 'ok',
        mode: 'sparse',
        data: {
          resolvedName: 'Darcy'
        },
        error: null
      });
    } finally {
      await app.close();
    }
  });

  it('returns lowConfidence as a product outcome', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: createRequest({ selectedText: 'This does not look like a character' })
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        requestId: 'request-123',
        status: 'ok',
        mode: 'lowConfidence',
        data: {
          message: expect.any(String)
        },
        error: null
      });
    } finally {
      await app.close();
    }
  });

  it('returns request_invalid when the schema contract is not met', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: {
          requestId: 'request-123',
          documentId: 'doc-1',
          selectedText: 'Darcy',
          selectedPage: 10,
          localContext: 'Elizabeth looked at Darcy.'
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        requestId: 'request-123',
        status: 'error',
        mode: null,
        data: null,
        error: {
          code: 'REQUEST_INVALID',
          message: 'The refresher request did not match the public API contract.',
          retryable: false
        }
      });
    } finally {
      await app.close();
    }
  });

  it('returns request_invalid when internal request normalization finds no visible text', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/refresher',
        payload: createRequest({ selectedText: '   ' })
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        requestId: 'request-123',
        status: 'error',
        mode: null,
        data: null,
        error: {
          code: 'REQUEST_INVALID',
          message: 'The refresher request must include visible selected text.',
          retryable: false
        }
      });
    } finally {
      await app.close();
    }
  });
});
