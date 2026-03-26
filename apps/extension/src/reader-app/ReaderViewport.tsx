import { useEffect, useEffectEvent, useRef } from 'react';

import { PdfViewerAdapter } from '../pdf/PdfViewerAdapter';
import type { PdfSession } from '../pdf/PdfSession';
import type { ReaderDocumentState } from './types';

export type ReaderViewportProps = {
  document: ReaderDocumentState;
  session: PdfSession | null;
  zoom: number;
  onCurrentPageChange: (pageNumber: number) => void;
  onRenderError: (message: string) => void;
};

export function ReaderViewport(props: ReaderViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<PdfViewerAdapter | null>(null);

  const reportPageChange = useEffectEvent((pageNumber: number) => {
    props.onCurrentPageChange(pageNumber);
  });

  const reportRenderError = useEffectEvent((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Failed to render PDF document.';
    props.onRenderError(message);
  });

  // Keep the live PDF.js viewer stable across page-change rerenders.
  useEffect(() => {
    if (!props.session || props.document.status !== 'ready') {
      adapterRef.current?.destroy();
      adapterRef.current = null;
      return;
    }

    const container = containerRef.current;
    const viewer = viewerRef.current;

    if (!container || !viewer) {
      return;
    }

    const adapter = new PdfViewerAdapter({
      container,
      viewer,
      onCurrentPageChange: reportPageChange
    });

    adapterRef.current = adapter;

    void adapter.openDocument(props.session.pdfDocument).catch((error) => {
      if (adapterRef.current === adapter) {
        reportRenderError(error);
      }
    });

    return () => {
      if (adapterRef.current === adapter) {
        adapterRef.current = null;
      }

      adapter.destroy();
    };
  }, [props.document.status, props.session]);

  useEffect(() => {
    adapterRef.current?.setZoom(props.zoom);
  }, [props.zoom]);

  return (
    <div className="reader-viewport">
      {props.document.status === 'idle' ? (
        <section className="reader-stage reader-stage--empty">
          <div className="stack">
            <div className="badge">Reader shell ready</div>
            <strong>Open a local PDF to start reading.</strong>
            <p className="subtle" style={{ margin: 0 }}>
              Milestone 1 now uses the real PDF.js viewer path for local files only.
            </p>
          </div>
        </section>
      ) : null}

      {props.document.status === 'loading' ? (
        <section className="reader-stage reader-stage--empty">
          <div className="stack">
            <div className="badge">Loading PDF</div>
            <strong>{props.document.fileName}</strong>
            <p className="subtle" style={{ margin: 0 }}>
              Preparing the PDF.js document and rendering surface.
            </p>
          </div>
        </section>
      ) : null}

      {props.document.status === 'error' ? (
        <section className="reader-stage reader-stage--empty">
          <div className="stack">
            <div className="badge">Load failed</div>
            <strong>{props.document.fileName || 'Unable to open PDF'}</strong>
            <p className="subtle" style={{ margin: 0 }}>
              {props.document.errorMessage ?? 'The reader could not load this PDF file.'}
            </p>
          </div>
        </section>
      ) : null}

      {props.document.status === 'ready' && props.session ? (
        <section className="reader-stage reader-stage--viewer">
          <div ref={containerRef} className="pdfjs-container">
            <div ref={viewerRef} className="pdfViewer" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
