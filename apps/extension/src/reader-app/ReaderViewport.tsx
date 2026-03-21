import type { ReaderDocumentState } from './types';

export function ReaderViewport({ document }: { document: ReaderDocumentState }) {
  return (
    <div className="reader-viewport">
      <section className="reader-stage">
        {document.isLoaded ? (
          <div className="stack">
            <div className="badge">Milestone 1 placeholder</div>
            <strong>{document.fileName}</strong>
            <p className="subtle" style={{ margin: 0 }}>
              PDF.js is installed and the repo structure is ready, but the real viewer adapter still needs to be wired.
            </p>
          </div>
        ) : (
          <div className="stack">
            <div className="badge">Reader shell ready</div>
            <p style={{ margin: 0 }}>Open a local PDF to start the Milestone 1 implementation path.</p>
          </div>
        )}
      </section>
    </div>
  );
}
