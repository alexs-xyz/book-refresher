import type { ChangeEvent } from 'react';

export type ReaderToolbarProps = {
  documentName: string;
  zoom: number;
  currentPage: number;
  onFileChange: (file: File | null) => void;
  onZoomChange: (nextZoom: number) => void;
  onPingBackend: () => void;
  onRunScaffoldRefresher: () => void;
};

export function ReaderToolbar(props: ReaderToolbarProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onFileChange(event.target.files?.[0] ?? null);
  };

  return (
    <div className="toolbar">
      <label>
        <strong>Open PDF</strong>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </label>
      <span>Page: {props.currentPage}</span>
      <span>Zoom: {props.zoom}%</span>
      <button type="button" onClick={() => props.onZoomChange(Math.max(50, props.zoom - 10))}>-</button>
      <button type="button" onClick={() => props.onZoomChange(Math.min(200, props.zoom + 10))}>+</button>
      <button type="button" onClick={props.onPingBackend}>Health</button>
      <button type="button" onClick={props.onRunScaffoldRefresher}>Scaffold refresh</button>
      <span className="spacer" />
      <span className="subtle">{props.documentName || 'No document open'}</span>
    </div>
  );
}
