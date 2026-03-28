// @vitest-environment jsdom

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { describe, expect, it, vi } from 'vitest';

import { SafePrefixBuilder } from './SafePrefixBuilder';
import type { SelectionState } from './types';

const createSelectionState = (
  range: Range,
  selectedText: string,
  selectedPage: number | null,
  isValid: boolean
): SelectionState => ({
  selectedText,
  selectedPage,
  selectionRange: range,
  anchorRect: null,
  localContext: '',
  isValid
});

const createPdfDocumentStub = (): PDFDocumentProxy => {
  return {} as PDFDocumentProxy;
};

describe('SafePrefixBuilder', () => {
  it('assembles earlier-page text and the clipped selected-page prefix without later same-page text', async () => {
    document.body.innerHTML = `
      <div id="reader">
        <div class="page" data-page-number="4">
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

    const builder = new SafePrefixBuilder({
      root,
      pdfDocument: createPdfDocumentStub(),
      pdfTextExtractor: {
        getEarlierPageText: vi.fn().mockResolvedValue('Earlier chapter text')
      } as never
    });

    const result = await builder.build(createSelectionState(range, 'Darcy', 4, true));

    expect(result.selectedPage).toBe(4);
    expect(result.earlierPagesText).toBe('Earlier chapter text');
    expect(result.selectedPagePrefix).toBe('Elizabeth looked at Darcy');
    expect(result.prefixText).toBe('Earlier chapter text\n\nElizabeth looked at Darcy');
    expect(result.prefixText).not.toContain('smiled');
    expect(result.localContext).toContain('Darcy');
  });

  it('rejects multi-page selections during boundary construction', async () => {
    document.body.innerHTML = `
      <div id="reader">
        <div class="page" data-page-number="4">
          <div class="textLayer">
            <span id="page4">Darcy</span>
          </div>
        </div>
        <div class="page" data-page-number="5">
          <div class="textLayer">
            <span id="page5">Bingley</span>
          </div>
        </div>
      </div>
    `;

    const root = document.getElementById('reader');
    const startText = document.getElementById('page4')?.firstChild;
    const endText = document.getElementById('page5')?.firstChild;
    if (!root || !startText || !endText) {
      throw new Error('Expected reader root and page text nodes.');
    }

    const range = document.createRange();
    range.setStart(startText, 0);
    range.setEnd(endText, endText.textContent?.length ?? 0);

    const builder = new SafePrefixBuilder({
      root,
      pdfDocument: createPdfDocumentStub(),
      pdfTextExtractor: {
        getEarlierPageText: vi.fn().mockResolvedValue('')
      } as never
    });

    await expect(builder.build(createSelectionState(range, 'Darcy Bingley', null, false))).rejects.toMatchObject({
      reason: 'multiPageSelection'
    });
  });
});
