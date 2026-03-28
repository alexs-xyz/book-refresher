// @vitest-environment jsdom

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PdfSession } from '../../pdf/PdfSession';
import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';
import { BookRefresherRequestBuilder } from './BookRefresherRequestBuilder';

const createSelectionState = (range: Range): SelectionState => ({
  selectedText: 'Darcy',
  selectedPage: 2,
  selectionRange: range,
  anchorRect: null,
  localContext: '',
  isValid: true
});

const createPdfDocument = (): PDFDocumentProxy => {
  return {
    getPage: vi.fn().mockResolvedValue({
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          { str: 'Earlier', width: 34, transform: [1, 0, 0, 12, 0, 24] },
          { str: 'page', width: 24, transform: [1, 0, 0, 12, 40, 24] },
          { str: 'text.', width: 24, transform: [1, 0, 0, 12, 70, 24] }
        ]
      })
    })
  } as unknown as PDFDocumentProxy;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BookRefresherRequestBuilder', () => {
  it('builds a real spoiler-safe request payload from the active pdf session', async () => {
    document.body.innerHTML = `
      <div id="reader">
        <div class="page" data-page-number="2">
          <div class="textLayer">
            <span id="before">Elizabeth looked at </span>
            <span id="target">Darcy</span>
            <span id="after"> and smiled.</span>
          </div>
        </div>
      </div>
    `;

    const root = document.getElementById('reader');
    const targetText = document.getElementById('target')?.firstChild;
    if (!root || !targetText) {
      throw new Error('Expected reader root and target text node.');
    }

    const range = document.createRange();
    range.setStart(targetText, 0);
    range.setEnd(targetText, targetText.textContent?.length ?? 0);

    const builder = new BookRefresherRequestBuilder();
    const session = {
      documentId: 'doc_reader',
      fileName: 'novel.pdf',
      pageCount: 12,
      fingerprint: 'reader',
      pdfDocument: createPdfDocument()
    } satisfies PdfSession;
    const documentState: ReaderDocumentState = {
      documentId: 'doc_reader',
      fileName: 'novel.pdf',
      pageCount: 12,
      isLoaded: true,
      status: 'ready'
    };

    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000123');

    const request = await builder.build(createSelectionState(range), documentState, {
      root,
      session,
      chosenCandidateId: 'cand_main'
    });

    expect(request).toEqual({
      requestId: '00000000-0000-4000-8000-000000000123',
      documentId: 'doc_reader',
      selectedText: 'Darcy',
      selectedPage: 2,
      localContext: 'Earlier page text.\n\nElizabeth looked at Darcy',
      prefixText: 'Earlier page text.\n\nElizabeth looked at Darcy',
      chosenCandidateId: 'cand_main',
      documentMeta: {
        fileName: 'novel.pdf',
        pageCount: 12
      }
    });
    expect(request.prefixText).not.toContain('smiled');
  });
});
