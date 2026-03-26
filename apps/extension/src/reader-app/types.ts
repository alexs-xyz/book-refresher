export type ReaderDocumentStatus = 'idle' | 'loading' | 'ready' | 'error';

export type ReaderDocumentState = {
  documentId: string;
  fileName: string;
  pageCount: number;
  isLoaded: boolean;
  status: ReaderDocumentStatus;
  errorMessage?: string;
};
