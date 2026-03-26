import type { ChangeEvent } from 'react';

export type ReaderToolbarProps = {
  documentName: string;
  zoom: number;
  currentPage: number;
  pageCount: number;
  isDocumentReady: boolean;
  onFileChange: (file: File | null) => void;
  onZoomChange: (nextZoom: number) => void;
};

export function ReaderToolbar(props: ReaderToolbarProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onFileChange(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const pageLabel = props.pageCount > 0 ? `${props.currentPage} / ${props.pageCount}` : 'No document';

  return (
    <div className="toolbar">
      <label>
        <strong>Open PDF</strong>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </label>
      <span className="page-metric">Page: {pageLabel}</span>
      <span>Zoom: {props.zoom}%</span>
      <button
        type="button"
        onClick={() => props.onZoomChange(props.zoom - 10)}
        disabled={!props.isDocumentReady || props.zoom <= 50}
      >
        -
      </button>
      <button
        type="button"
        onClick={() => props.onZoomChange(props.zoom + 10)}
        disabled={!props.isDocumentReady || props.zoom >= 200}
      >
        +
      </button>
      <span className="spacer" />
      <span className="subtle">{props.documentName || 'No document open'}</span>
    </div>
  );
}
