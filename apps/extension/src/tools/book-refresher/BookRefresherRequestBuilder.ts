import type { RefresherRequest } from '@book-refresher/shared-types';

import type { PdfSession } from '../../pdf/PdfSession';
import { SafePrefixBuilder } from '../../selection/SafePrefixBuilder';
import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';

export type BookRefresherRequestBuildContext = {
  root: HTMLElement;
  session: PdfSession;
  chosenCandidateId?: string | null;
};

export class BookRefresherRequestBuilder {
  async build(
    selection: SelectionState,
    document: ReaderDocumentState,
    context: BookRefresherRequestBuildContext
  ): Promise<RefresherRequest> {
    const safePrefix = await new SafePrefixBuilder({
      root: context.root,
      pdfDocument: context.session.pdfDocument
    }).build(selection);

    return {
      requestId: crypto.randomUUID(),
      documentId: document.documentId,
      selectedText: selection.selectedText,
      selectedPage: safePrefix.selectedPage,
      localContext: safePrefix.localContext,
      prefixText: safePrefix.prefixText,
      ...(context.chosenCandidateId !== undefined
        ? { chosenCandidateId: context.chosenCandidateId }
        : {}),
      documentMeta: {
        fileName: document.fileName,
        pageCount: document.pageCount || undefined
      }
    };
  }
}
