import type { RefresherRequest } from '@book-refresher/shared-types';

import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';

function assertSelectionReadyForRequest(
  selection: SelectionState
): asserts selection is SelectionState & { selectedPage: number } {
  if (!selection.isValid || selection.selectedPage === null) {
    throw new Error('Cannot build a refresher request from an invalid or incomplete selection.');
  }
}

const resolveLocalContext = (selection: SelectionState): string => {
  const localContext = selection.localContext.trim();
  return localContext || selection.selectedText;
};

export class BookRefresherRequestBuilder {
  build(selection: SelectionState, document: ReaderDocumentState): RefresherRequest {
    assertSelectionReadyForRequest(selection);
    const localContext = resolveLocalContext(selection);

    return {
      requestId: crypto.randomUUID(),
      documentId: document.documentId,
      selectedText: selection.selectedText,
      selectedPage: selection.selectedPage,
      localContext,
      prefixText: 'TODO: safe prefix not implemented yet',
      documentMeta: {
        fileName: document.fileName,
        pageCount: document.pageCount || undefined
      }
    };
  }
}
