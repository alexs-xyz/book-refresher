export type PdfSession = {
  documentId: string;
  fileName: string;
  pageCount: number;
};

export function createPdfSession(file: File): PdfSession {
  return {
    documentId: `doc_${crypto.randomUUID()}`,
    fileName: file.name,
    pageCount: 0
  };
}
