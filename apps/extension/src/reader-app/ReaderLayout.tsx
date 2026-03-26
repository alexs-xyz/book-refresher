import type { ReactNode } from 'react';

export function ReaderLayout({ toolbar, viewport, overlay }: { toolbar: ReactNode; viewport: ReactNode; overlay: ReactNode }) {
  return (
    <div className="reader-layout">
      {toolbar}
      <div style={{ position: 'relative' }}>
        {viewport}
        {overlay ? <div className="overlay-host">{overlay}</div> : null}
      </div>
    </div>
  );
}
