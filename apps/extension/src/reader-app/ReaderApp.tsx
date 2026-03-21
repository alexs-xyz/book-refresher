import { useEffect, useMemo, useState } from 'react';

import { ApiClient } from '../api/ApiClient';
import { HealthApi } from '../api/HealthApi';
import { RefresherApi } from '../api/RefresherApi';
import { settingsRepository } from '../extension/storage/settings-repository';
import { createPdfSession, type PdfSession } from '../pdf/PdfSession';
import { SelectionController } from '../selection/SelectionController';
import { BookRefresherController } from '../tools/book-refresher/BookRefresherController';
import { BookRefresherPopup } from '../tools/book-refresher/BookRefresherPopup';
import type { PopupState } from '../tools/book-refresher/types';
import { ReaderLayout } from './ReaderLayout';
import { ReaderOverlayHost } from './ReaderOverlayHost';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderViewport } from './ReaderViewport';
import type { ReaderDocumentState } from './types';

const initialDocumentState: ReaderDocumentState = {
  documentId: `doc_${crypto.randomUUID()}`,
  fileName: '',
  pageCount: 0,
  isLoaded: false
};

const initialPopupState: PopupState = {
  mode: 'hidden',
  response: null
};

export function ReaderApp() {
  const [document, setDocument] = useState<ReaderDocumentState>(initialDocumentState);
  const [zoom, setZoom] = useState(100);
  const [currentPage] = useState(1);
  const [popupState, setPopupState] = useState<PopupState>(initialPopupState);
  const [backendStatus, setBackendStatus] = useState<string>('unknown');
  const [backendBaseUrl, setBackendBaseUrl] = useState('http://127.0.0.1:8787');

  useEffect(() => {
    void settingsRepository.get().then((settings) => {
      setBackendBaseUrl(settings.backendBaseUrl);
      setBackendStatus(`backend target: ${settings.backendBaseUrl}`);
    });
  }, []);

  const client = useMemo(() => new ApiClient(backendBaseUrl), [backendBaseUrl]);
  const healthApi = useMemo(() => new HealthApi(client), [client]);
  const refresherController = useMemo(
    () => new BookRefresherController(new RefresherApi(client)),
    [client]
  );
  const selectionController = useMemo(() => new SelectionController(), []);

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setDocument(initialDocumentState);
      return;
    }

    const session: PdfSession = createPdfSession(file);
    setDocument({
      documentId: session.documentId,
      fileName: session.fileName,
      pageCount: session.pageCount,
      isLoaded: true
    });
  };

  const pingBackend = async () => {
    try {
      const health = await healthApi.getHealth();
      setBackendStatus(`${health.service} (${health.environment ?? 'unknown env'})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown health check error';
      setBackendStatus(`health failed: ${message}`);
    }
  };

  const runScaffoldRefresher = async () => {
    const selection = selectionController.getCurrentSelection();

    if (!selection.isValid) {
      setPopupState({
        mode: 'error',
        response: null,
        message: selection.invalidReason
      });
      return;
    }

    setPopupState({ mode: 'loading', response: null });

    try {
      const response = await refresherController.request(selection, document);
      setPopupState({
        mode: response.status === 'error' ? 'error' : response.mode,
        response
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown scaffold refresher error';
      setPopupState({
        mode: 'error',
        response: null,
        message
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
          onFileChange={handleFileChange}
          onZoomChange={setZoom}
          onPingBackend={pingBackend}
          onRunScaffoldRefresher={runScaffoldRefresher}
        />
      }
      viewport={<ReaderViewport document={document} />}
      overlay={
        <ReaderOverlayHost>
          <div className="stack">
            <div className="card">
              <strong>Backend</strong>
              <p className="subtle" style={{ marginBottom: 0 }}>{backendStatus}</p>
            </div>
            <BookRefresherPopup state={popupState} />
          </div>
        </ReaderOverlayHost>
      }
    />
  );
}
