# Book Refresher

Starter monorepo for the Book Refresher MVP.

This repo is organized for Codex-friendly development:
- source-of-truth product and architecture docs in `docs/`
- execution backlog in `backlog/`
- Codex guidance in `AGENTS.md`
- reusable agent workflows in `.agents/skills/`
- runnable starter packages in `apps/` and `packages/`

## Workspace layout

```text
apps/
  backend/
  extension/
packages/
  shared-types/
backlog/
docs/
plans/
.agents/skills/
```

## Current status

This scaffold intentionally focuses on:
- real monorepo wiring
- schema-first shared contracts
- a strict backend/extension/runtime split
- a stubbed but typed `POST /api/refresher` flow
- a minimal reader shell for Milestone 1

It does **not** yet implement the real PDF.js reader integration, selection boundary capture, or final refresher pipeline.

## Stack

- `pnpm` workspace monorepo
- TypeScript across all packages
- `apps/backend`: Fastify + Zod
- `apps/extension`: React + Vite + Manifest V3 + PDF.js dependency ready
- `packages/shared-types`: Zod schemas + exported inferred types
- Vitest for starter tests

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Build shared contracts once

```bash
pnpm --filter @book-refresher/shared-types build
```

### 3. Start the backend

```bash
pnpm dev:backend
```

Backend default URL: `http://127.0.0.1:8787`

### 4. Start the extension dev server

```bash
pnpm dev:extension
```

### 5. Load the extension

Build the extension or use the dev workflow from the Vite/CRX plugin output, then load it as an unpacked extension in Chromium.

## Useful commands

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

## First recommended build slice

1. Keep `packages/shared-types` as the public contract boundary.
2. Replace the stub refresher service with the real backend pipeline.
3. Replace `ReaderViewport` placeholder content with real PDF.js rendering.
4. Add selection + popup shell.
5. Add safe-prefix construction.

## Notes

- Backend CORS is allowlist-based. Configure `CORS_ORIGINS` in `apps/backend/.env.example`.
- The extension currently assumes a local backend host permission for development.
- The shared package is intentionally small: public API contracts only.
