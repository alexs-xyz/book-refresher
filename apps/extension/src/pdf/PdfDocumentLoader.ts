import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { createPdfSession, type PdfSession } from './PdfSession';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export class PdfDocumentLoader {
  async loadFromFile(file: File): Promise<PdfSession> {
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = getDocument({ data });

    try {
      const pdfDocument = await loadingTask.promise;
      return createPdfSession(file, pdfDocument);
    } catch (error) {
      await loadingTask.destroy();
      throw error;
    }
  }
}
