import type { RefresherRequest } from '@book-refresher/shared-types';

import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';

export class BookRefresherRequestBuilder {
  build(selection: SelectionState, document: ReaderDocumentState): RefresherRequest {
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
