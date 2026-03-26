# Book Refresher — Codex Working Guide

## What this repo is
Book Refresher is a custom PDF.js-based browser reader with Book Refresher as the first integrated tool.

The product promise is spoiler safety by architecture: the backend must only ever receive text from the beginning of the document up to the exact selected boundary.

## Source-of-truth docs
Read the smallest relevant set of docs before making changes.

### Product
- `docs/product/prd.md`
- `docs/planning/mvp-milestone-plan.md`

### Architecture
- `docs/architecture/technical-architecture.md`
- `docs/architecture/frontend-architecture.md`
- `docs/architecture/backend-api-and-architecture.md`
- `docs/architecture/shared-types-and-api-schema.md`
- `docs/codex/repo-structure-and-workflow.md`

### Planning / execution
- `backlog/README.md`
- `backlog/*.md`
- `plans/*.md`

## Repository shape
This repo uses a TypeScript monorepo layout.

```text
apps/
  extension/
  backend/
packages/
  shared-types/
docs/
backlog/
plans/
.agents/skills/
```

## Recommended stack
Unless the repo already contains a different concrete implementation, prefer:
- `pnpm` workspaces
- TypeScript across all packages
- `apps/extension`: React + Vite + Manifest V3 + PDF.js
- `apps/backend`: Fastify + Zod + typed config layer
- `packages/shared-types`: Zod schema-first contracts + exported TypeScript types
- Vitest for unit tests where practical

Do not add a database, background workers, semantic retrieval, or persistent character memory in MVP.

## Architectural rules you must preserve
- Spoiler safety is enforced by the client-side safe-prefix boundary, not by prompt wording alone.
- The backend does not parse the original PDF in V1.
- The backend is stateless in V1.
- `normal`, `sparse`, `ambiguous`, and `lowConfidence` are valid product outcomes, not errors.
- Provider secrets live only on the backend.
- Do not introduce wildcard CORS in the backend.
- Do not move DOM/PDF.js/UI-local types into `packages/shared-types`.

## Shared contract rules
- Treat `packages/shared-types` as the public contract boundary.
- Prefer schema-first definitions for request/response shapes.
- Update frontend and backend together when contracts change.
- Do not casually rename fields like `selectedText`, `prefixText`, `mode`, or `chosenCandidateId`.

## Working style
- For complex or ambiguous work, plan first and write/update a file in `plans/`.
- Keep tasks scoped to one backlog slice when possible.
- Prefer small reviewable diffs over broad rewrites.
- Reuse existing modules before creating new ones.
- Keep extension logic thin; keep reader logic in the reader app.
- Keep PDF.js specifics behind adapter-style boundaries.
- Keep backend SDK/provider details behind provider adapters.

## Definition of done
A change is not done until all of the following are true when relevant:
- implementation matches the relevant source-of-truth docs
- the correct shared contracts are used or updated
- tests added/updated for changed behavior where practical
- lint, typecheck, and relevant tests pass
- no unrelated refactors were mixed into the diff
- docs are updated if behavior or structure changed

## Verification checklist
Before handing work back:
1. Explain what changed.
2. List exactly which files changed.
3. Report which commands were run.
4. Report their results honestly.
5. Call out any unresolved mismatch between implementation and docs.

## Commands
Fill these in once the repo is initialized. Until then, do not invent passing command output.

### Workspace
- install: `pnpm install`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`

### Extension
- dev: `pnpm --filter @book-refresher/extension dev`
- build: `pnpm --filter @book-refresher/extension build`
- test: `pnpm --filter @book-refresher/extension test`

### Backend
- dev: `pnpm --filter @book-refresher/backend dev`
- build: `pnpm --filter @book-refresher/backend build`
- test: `pnpm --filter @book-refresher/backend test`

### Shared types
- build: `pnpm --filter @book-refresher/shared-types build`
- test: `pnpm --filter @book-refresher/shared-types test`

## What not to do
- Do not implement public-release auth, billing, analytics pipelines, or multi-service orchestration in MVP.
- Do not add proactive summarization or background processing while the user reads.
- Do not silently guess through ambiguity.
- Do not ship backend secrets into the extension.
- Do not claim tests passed if they were not run.


