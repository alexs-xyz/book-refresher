import type { PDFDocumentProxy } from 'pdfjs-dist';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPdfSession, destroyPdfSession } from './PdfSession';

const createMockPdfDocument = (
  fingerprints: Array<string | null> = ['reader-fingerprint', null],
  pageCount = 12
): PDFDocumentProxy => {
  return {
    fingerprints,
    numPages: pageCount,
    destroy: vi.fn().mockResolvedValue(undefined)
  } as unknown as PDFDocumentProxy;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createPdfSession', () => {
  it('uses the document fingerprint for a stable document id', () => {
    const file = new File(['%PDF-1.7'], 'sample.pdf', { type: 'application/pdf' });
    const pdfDocument = createMockPdfDocument(['fingerprint-123', null], 42);

    const session = createPdfSession(file, pdfDocument);

    expect(session.documentId).toBe('doc_fingerprint-123');
    expect(session.fileName).toBe('sample.pdf');
    expect(session.pageCount).toBe(42);
    expect(session.fingerprint).toBe('fingerprint-123');
  });

  it('falls back to a generated id when the pdf fingerprint is missing', () => {
    const randomUuid = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-4000-8000-000000000000');
    const file = new File(['%PDF-1.7'], 'fallback.pdf', { type: 'application/pdf' });
    const pdfDocument = createMockPdfDocument([null, null], 5);

    const session = createPdfSession(file, pdfDocument);

    expect(randomUuid).toHaveBeenCalledOnce();
    expect(session.documentId).toBe('doc_00000000-0000-4000-8000-000000000000');
    expect(session.fingerprint).toBe('00000000-0000-4000-8000-000000000000');
  });
});

describe('destroyPdfSession', () => {
  it('destroys the active pdf document when present', async () => {
    const pdfDocument = createMockPdfDocument();
    const session = createPdfSession(
      new File(['%PDF-1.7'], 'destroy.pdf', { type: 'application/pdf' }),
      pdfDocument
    );

    await destroyPdfSession(session);

    expect(pdfDocument.destroy).toHaveBeenCalledOnce();
  });
});
