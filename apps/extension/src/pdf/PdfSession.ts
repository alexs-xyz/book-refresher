import type { PDFDocumentProxy } from 'pdfjs-dist';

export type PdfSession = {
  documentId: string;
  fileName: string;
  pageCount: number;
  fingerprint: string;
  pdfDocument: PDFDocumentProxy;
};

export function createPdfSession(file: File, pdfDocument: PDFDocumentProxy): PdfSession {
  const fingerprint = pdfDocument.fingerprints[0] ?? crypto.randomUUID();

  return {
    documentId: `doc_${fingerprint}`,
    fileName: file.name,
    pageCount: pdfDocument.numPages,
    fingerprint,
    pdfDocument
  };
}

export async function destroyPdfSession(session: PdfSession | null): Promise<void> {
  if (!session) {
    return;
  }

  await session.pdfDocument.destroy();
}
