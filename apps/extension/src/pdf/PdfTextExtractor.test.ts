import type { PDFDocumentProxy } from 'pdfjs-dist';
import { describe, expect, it, vi } from 'vitest';

import { PdfTextExtractor } from './PdfTextExtractor';

type MockTextItem = {
  str: string;
  width: number;
  transform: number[];
  hasEOL?: boolean;
};

const createMockPdfDocument = (pages: MockTextItem[][]): PDFDocumentProxy => {
  return {
    getPage: vi.fn(async (pageNumber: number) => {
      const items = pages[pageNumber - 1];
      return {
        getTextContent: vi.fn().mockResolvedValue({ items })
      };
    })
  } as unknown as PDFDocumentProxy;
};

describe('PdfTextExtractor', () => {
  it('extracts earlier pages in document order with light spacing and line handling', async () => {
    const pdfDocument = createMockPdfDocument([
      [
        { str: 'Elizabeth', width: 50, transform: [1, 0, 0, 12, 0, 24] },
        { str: 'looked', width: 35, transform: [1, 0, 0, 12, 62, 24] },
        { str: 'away.', width: 30, transform: [1, 0, 0, 12, 109, 24], hasEOL: true },
        { str: 'Mr.', width: 18, transform: [1, 0, 0, 12, 0, 8] },
        { str: 'Darcy', width: 36, transform: [1, 0, 0, 12, 24, 8] }
      ],
      [
        { str: 'Jane', width: 24, transform: [1, 0, 0, 12, 0, 24] },
        { str: 'arrived.', width: 44, transform: [1, 0, 0, 12, 35, 24] }
      ]
    ]);

    const extractor = new PdfTextExtractor(pdfDocument);

    await expect(extractor.getEarlierPageText(3)).resolves.toBe(
      'Elizabeth looked away.\nMr. Darcy\n\nJane arrived.'
    );
  });

  it('returns an empty string when the selection is on the first page', async () => {
    const extractor = new PdfTextExtractor(createMockPdfDocument([]));

    await expect(extractor.getEarlierPageText(1)).resolves.toBe('');
  });
});
