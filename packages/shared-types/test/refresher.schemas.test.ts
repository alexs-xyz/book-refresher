import { describe, expect, it } from 'vitest';

import {
  refresherRequestSchema,
  refresherResponseSchema
} from '../src';

describe('shared refresher schemas', () => {
  it('accepts a valid refresher request', () => {
    const result = refresherRequestSchema.safeParse({
      requestId: 'req_123',
      documentId: 'doc_123',
      selectedText: 'Darcy',
      selectedPage: 12,
      localContext: 'Elizabeth looked at Darcy.',
      prefixText: 'Earlier text goes here.'
    });

    expect(result.success).toBe(true);
  });

  it('accepts an ambiguous response', () => {
    const result = refresherResponseSchema.safeParse({
      requestId: 'req_123',
      status: 'ok',
      mode: 'ambiguous',
      data: {
        selectedText: 'Tom',
        choices: [{ id: 'cand_1', label: 'Tom Sawyer' }]
      },
      error: null
    });

    expect(result.success).toBe(true);
  });
});
