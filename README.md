# Book Refresher

Book Refresher is a TypeScript monorepo for a custom PDF.js-based browser reader. The long-term product is a spoiler-safe character refresher tool, but the current implemented slice is the reader foundation: open a local PDF, render it in the custom reader, scroll, zoom, and select text from the PDF.js text layer.

## What is in the repo

```text
apps/
  backend/          Fastify API scaffold
  extension/        Browser extension + reader application
packages/
  shared-types/     Shared API contracts
backlog/            Backlog slices
docs/               Product and architecture docs
plans/              Task plans
.agents/skills/     Local Codex skills
```

## Current application status

Implemented now:
- monorepo workspace wiring
- backend scaffold with health/refresher routes
- extension action that opens the internal reader page
- local PDF loading through PDF.js
- PDF page rendering inside the reader
- visible/selectable text layer
- reader page tracking and zoom controls

Not implemented yet:
- right-click Book Refresher flow
- popup states in the live reader
- safe-prefix construction
- real backend refresher pipeline

## Prerequisites

- Node.js `>=20.19.0`
- `pnpm@10.32.1` (matches the root `packageManager` field)

The simplest way to get the expected pnpm version is Corepack:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

If `pnpm --filter ...` fails with `ERROR Unknown option: 'recursive'`, the installed pnpm is older than this repo expects.

If `pnpm` is not installed globally, you can also use `npm exec --yes --package=pnpm@10.32.1 -- pnpm ...` in its place.

## Install

From the repo root, after activating `pnpm@10.32.1`:

```bash
pnpm install
```

This installs dependencies for the root workspace plus:
- `apps/backend`
- `apps/extension`
- `packages/shared-types`

## Start the application

There are two practical ways to run the current app:

1. Run the reader page directly in local development.
2. Build and load the browser extension as an unpacked extension.

The first path is the fastest for reader development. The second path is the real extension workflow.

## Option 1: Run the reader page directly

This is the simplest way to start using the current Milestone 1 application.

### 1. Start the extension dev server

```bash
pnpm dev:extension
```

This starts Vite for `apps/extension`.

### 2. Open the reader page in the browser

Open:

```text
http://localhost:5173/reader.html
```

You can also open the landing page at:

```text
http://localhost:5173/
```

and follow the "Open reader page" link.

### 3. Use the reader

Once `reader.html` is open:

1. Click `Open PDF` in the top toolbar.
2. Choose a local PDF file from your machine.
3. Wait for PDF.js to load and render the document.
4. Scroll through the document in the main reader viewport.
5. Use `-` and `+` to adjust zoom.
6. Watch the page indicator update as you scroll.
7. Select text directly in the rendered text layer.

## Option 2: Run it as a browser extension

Use this path if you want to exercise the extension action and internal extension page flow.

### 1. Build the extension

```bash
pnpm --filter @book-refresher/extension build
```

This produces the unpacked extension build in:

```text
apps/extension/dist
```

### 2. Load the unpacked extension in Chromium

1. Open `chrome://extensions` or the equivalent Chromium extensions page.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select:

```text
apps/extension/dist
```

### 3. Open the reader from the extension

After the extension is loaded:

1. Click the Book Refresher extension icon in the toolbar.
2. The extension opens its internal `reader.html` page in a new tab.
3. Use `Open PDF` to choose a local PDF.
4. Read, scroll, zoom, and select text in the reader.

The service worker also registers an action context-menu entry named `Open Book Refresher Reader`.

## Backend setup

The current reader foundation does not require the backend to be running. You can open and use local PDFs without starting `apps/backend`.

Start the backend if you want the scaffolded API running in parallel for later slices:

```bash
pnpm dev:backend
```

Default backend URL:

```text
http://127.0.0.1:8787
```

### Backend environment

If you need custom backend settings, copy:

```text
apps/backend/.env.example
```

to a local `.env` file and adjust the values.

Default values:
- `HOST=127.0.0.1`
- `PORT=8787`
- `NODE_ENV=development`
- `SERVICE_NAME=book-refresher-backend`
- `APP_VERSION=0.1.0`
- `CORS_ORIGINS=http://localhost:5173,chrome-extension://YOUR_EXTENSION_ID`

For the current reader-only slice:
- `http://localhost:5173` matters when using the dev server path.
- the `chrome-extension://...` origin matters later when the built extension calls the backend.

## How to use the current application

The implemented application behavior is reader-only.

### Opening a document

- Use the `Open PDF` file picker in the toolbar.
- The current loading path is local file only.
- PDFs are loaded as file bytes and passed into PDF.js in the reader.

### Reading

- Pages render in the main viewport.
- The viewport scrolls vertically through the full document.
- The current page indicator updates as the visible page changes.
- Zoom controls adjust the PDF.js viewer scale.

### Selecting text

- The text layer is enabled.
- You can highlight/select text directly in the reader.
- This is groundwork for later selection-triggered Book Refresher flows.

### What to expect today

- The reader is a custom in-browser PDF surface, not the browser’s built-in PDF viewer.
- The extension action opens the reader page directly.
- The refresher feature is not wired into the reader interaction yet.
- There is no right-click refresher action yet.
- There is no spoiler-safe prefix capture yet.

## Recommended local workflow

For day-to-day frontend work on the reader:

1. Run `pnpm dev:extension`.
2. Open `http://localhost:5173/reader.html`.
3. Load a local text-based PDF.
4. Iterate on the reader UI and PDF behavior there.

For full extension smoke tests:

1. Run `pnpm --filter @book-refresher/extension build`.
2. Load `apps/extension/dist` as an unpacked extension.
3. Open the reader through the extension icon.

## Useful commands

Workspace:

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Package-specific:

```bash
pnpm --filter @book-refresher/shared-types build
pnpm --filter @book-refresher/shared-types test

pnpm --filter @book-refresher/backend dev
pnpm --filter @book-refresher/backend build
pnpm --filter @book-refresher/backend test

pnpm --filter @book-refresher/extension dev
pnpm --filter @book-refresher/extension build
pnpm --filter @book-refresher/extension test
```

## Limitations

- local files only for document loading
- best tested path is text-based PDFs, not image-only scans
- no IndexedDB/document persistence
- no authentication, billing, or database
- no live Book Refresher UI flow yet
- backend AI behavior is still scaffolded, not production behavior

## Source-of-truth docs

If you are working in the repo, these are the primary docs:

- `AGENTS.md`
- `docs/product/prd.md`
- `docs/planning/mvp-milestone-plan.md`
- `docs/architecture/technical-architecture.md`
- `docs/architecture/frontend-architecture.md`
- `docs/architecture/backend-api-and-architecture.md`
- `docs/architecture/shared-types-and-api-schema.md`
- `docs/codex/repo-structure-and-workflow.md`
- `docs/setup/local-development.md`

## Notes

- Keep `packages/shared-types` limited to cross-boundary contracts.
- Keep the extension thin and the reader page rich.
- Keep PDF.js-specific details behind the `apps/extension/src/pdf/` module boundary.
