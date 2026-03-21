export function LandingPage() {
  const readerUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('reader.html')
    : '/reader.html';

  return (
    <div className="page-shell">
      <header className="page-header">
        <strong>Book Refresher</strong>
      </header>
      <main className="page-content stack">
        <section className="card stack">
          <div className="badge">Starter scaffold</div>
          <h1 style={{ margin: 0 }}>Reader platform shell is wired</h1>
          <p className="subtle" style={{ margin: 0 }}>
            This landing page exists mainly for local development. The extension action opens the internal reader page.
          </p>
          <div className="row">
            <a href={readerUrl}>Open reader page</a>
          </div>
        </section>
      </main>
    </div>
  );
}
