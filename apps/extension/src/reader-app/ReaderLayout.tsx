import type { ReactNode } from 'react';

export function ReaderLayout({ toolbar, viewport, overlay }: { toolbar: ReactNode; viewport: ReactNode; overlay: ReactNode }) {
  return (
    <div className="reader-layout">
      {toolbar}
      <div style={{ position: 'relative' }}>
        {viewport}
        <div className="overlay-host">{overlay}</div>
      </div>
    </div>
  );
}
