# Local Development

## Backend

Copy `apps/backend/.env.example` to `.env` if you want custom values.

Default values:
- host: `127.0.0.1`
- port: `8787`
- allowed origin: `http://localhost:5173`

Run:

```bash
pnpm --filter @book-refresher/shared-types build
pnpm --filter @book-refresher/backend dev
```

## Extension

Run:

```bash
pnpm --filter @book-refresher/shared-types build
pnpm --filter @book-refresher/extension dev
```

The extension action opens the internal `reader.html` page.

## Current scaffold limits

- PDF.js is installed but not yet wired into the real render path.
- right-click Book Refresher inside the reader is not implemented yet
- backend refresher results are deterministic scaffold responses, not the final AI pipeline
