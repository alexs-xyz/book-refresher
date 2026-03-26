# Local Development

Use `pnpm@10.32.1` for this repo so the workspace commands match the root `packageManager` field.

If `pnpm --filter ...` fails with `ERROR Unknown option: 'recursive'`, activate the pinned pnpm version first:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

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

The current reader foundation does not require the backend to be running, but keeping it on is fine for full-stack local development.

## Extension

Run:

```bash
pnpm --filter @book-refresher/shared-types build
pnpm --filter @book-refresher/extension dev
```

Open:

```text
http://localhost:5173/reader.html
```

or build/load the unpacked extension and use the extension action. The extension action opens the internal `reader.html` page.

## Current local behavior

- PDF.js is wired into the reader render path.
- Local PDFs open in the custom reader.
- Pages render with a selectable text layer.
- Scroll and zoom are available in the reader toolbar.
- Current page tracking is active.
- right-click Book Refresher inside the reader is not implemented yet.
- backend refresher results are deterministic scaffold responses, not the final AI pipeline
