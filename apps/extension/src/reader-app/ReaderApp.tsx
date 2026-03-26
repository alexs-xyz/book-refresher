import { useEffect, useRef, useState } from 'react';

import { PdfDocumentLoader } from '../pdf/PdfDocumentLoader';
import { destroyPdfSession, type PdfSession } from '../pdf/PdfSession';
import { createEmptySelectionState } from '../selection/types';
import { ReaderLayout } from './ReaderLayout';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderViewport } from './ReaderViewport';
import type { ReaderDocumentState } from './types';

const createInitialDocumentState = (): ReaderDocumentState => ({
  documentId: `doc_${crypto.randomUUID()}`,
  fileName: '',
  pageCount: 0,
  isLoaded: false,
  status: 'idle'
});

const clampZoom = (nextZoom: number): number => {
  return Math.min(200, Math.max(50, nextZoom));
};

const reportSessionDestroyError = (error: unknown): void => {
  console.error('Failed to destroy PDF session.', error);
};

const destroySessionInBackground = (session: PdfSession | null): void => {
  if (!session) {
    return;
  }

  void destroyPdfSession(session).catch(reportSessionDestroyError);
};

export function ReaderApp() {
  const [document, setDocument] = useState<ReaderDocumentState>(createInitialDocumentState);
  const [session, setSession] = useState<PdfSession | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setSelection] = useState(createEmptySelectionState);
  const loaderRef = useRef(new PdfDocumentLoader());
  const activeSessionRef = useRef<PdfSession | null>(null);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      const activeSession = activeSessionRef.current;
      activeSessionRef.current = null;
      destroySessionInBackground(activeSession);
    };
  }, []);

  const handleRenderError = (message: string) => {
    const activeSession = activeSessionRef.current;
    activeSessionRef.current = null;
    setSession(null);
    setCurrentPage(1);
    destroySessionInBackground(activeSession);

    setDocument((currentDocument) => ({
      ...currentDocument,
      pageCount: 0,
      isLoaded: false,
      status: 'error',
      errorMessage: message
    }));
  };

  const handleFileChange = async (file: File | null) => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;

    const previousSession = activeSessionRef.current;
    if (!file) {
      activeSessionRef.current = null;
      setSession(null);
      setCurrentPage(1);
      setZoom(100);
      setDocument(createInitialDocumentState());

      if (previousSession) {
        try {
          await destroyPdfSession(previousSession);
        } catch (error) {
          reportSessionDestroyError(error);
        }
      }

      return;
    }

    activeSessionRef.current = null;
    setSession(null);
    setCurrentPage(1);
    setZoom(100);
    try {
      if (previousSession) {
        await destroyPdfSession(previousSession);
      }

      setDocument({
        documentId: `doc_${crypto.randomUUID()}`,
        fileName: file.name,
        pageCount: 0,
        isLoaded: false,
        status: 'loading'
      });

      const nextSession = await loaderRef.current.loadFromFile(file);

      if (loadRequestRef.current !== requestId) {
        await destroyPdfSession(nextSession);
        return;
      }

      activeSessionRef.current = nextSession;
      setSession(nextSession);
      setDocument({
        documentId: nextSession.documentId,
        fileName: nextSession.fileName,
        pageCount: nextSession.pageCount,
        isLoaded: true,
        status: 'ready'
      });
    } catch (error) {
      if (loadRequestRef.current !== requestId) {
        return;
      }

      setDocument({
        documentId: `doc_${crypto.randomUUID()}`,
        fileName: file.name,
        pageCount: 0,
        isLoaded: false,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to load PDF file.'
      });
    }
  };

  return (
    <ReaderLayout
      toolbar={
        <ReaderToolbar
          documentName={document.fileName}
          zoom={zoom}
          currentPage={currentPage}
          pageCount={document.pageCount}
          isDocumentReady={document.status === 'ready'}
          onFileChange={handleFileChange}
          onZoomChange={(nextZoom) => setZoom(clampZoom(nextZoom))}
        />
      }
      viewport={
        <ReaderViewport
          document={document}
          session={session}
          zoom={zoom}
          onCurrentPageChange={setCurrentPage}
          onSelectionChange={setSelection}
          onRenderError={handleRenderError}
        />
      }
      overlay={null}
    />
  );
}
