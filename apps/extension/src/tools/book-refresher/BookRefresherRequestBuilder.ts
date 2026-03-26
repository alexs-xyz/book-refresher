import type { RefresherRequest } from '@book-refresher/shared-types';

import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';

function assertSelectionReadyForRequest(
  selection: SelectionState
): asserts selection is SelectionState & { selectedPage: number } {
  if (!selection.isValid || selection.selectedPage === null || !selection.localContext.trim()) {
    throw new Error('Cannot build a refresher request from an invalid or incomplete selection.');
  }
}

export class BookRefresherRequestBuilder {
  build(selection: SelectionState, document: ReaderDocumentState): RefresherRequest {
    assertSelectionReadyForRequest(selection);

    return {
      requestId: crypto.randomUUID(),
      documentId: document.documentId,
      selectedText: selection.selectedText,
      selectedPage: selection.selectedPage,
      localContext: selection.localContext,
      prefixText: 'TODO: safe prefix not implemented yet',
      documentMeta: {
        fileName: document.fileName,
        pageCount: document.pageCount || undefined
      }
    };
  }
}
