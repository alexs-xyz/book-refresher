import { refresherRequestSchema } from '@book-refresher/shared-types';
import { describe, expect, it } from 'vitest';

import type { ReaderDocumentState } from '../../reader-app/types';
import type { SelectionState } from '../../selection/types';
import { BookRefresherRequestBuilder } from './BookRefresherRequestBuilder';

const documentState: ReaderDocumentState = {
  documentId: 'doc_pride_prejudice',
  fileName: 'pride-and-prejudice.pdf',
  pageCount: 42,
  isLoaded: true,
  status: 'ready'
};

const createSelection = (overrides: Partial<SelectionState> = {}): SelectionState => ({
  selectedText: 'Darcy',
  selectedPage: 4,
  selectionRange: null,
  anchorRect: null,
  localContext: '',
  isValid: true,
  ...overrides
});

describe('BookRefresherRequestBuilder', () => {
  it('falls back to the selected text when local context is not available yet', () => {
    const builder = new BookRefresherRequestBuilder();

    const request = builder.build(createSelection(), documentState);
    const parsed = refresherRequestSchema.parse(request);

    expect(parsed.localContext).toBe('Darcy');
    expect(parsed.selectedText).toBe('Darcy');
  });

  it('preserves extracted local context when present', () => {
    const builder = new BookRefresherRequestBuilder();

    const request = builder.build(
      createSelection({
        localContext: 'Elizabeth looked at Darcy and turned away.'
      }),
      documentState
    );

    expect(request.localContext).toBe('Elizabeth looked at Darcy and turned away.');
  });
});
