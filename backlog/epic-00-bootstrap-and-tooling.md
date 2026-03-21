# Epic 00 — Bootstrap and Tooling

## Goal
Create the repo skeleton and stable contract foundation so later Codex tasks operate inside a real structure.

## Slices

### BR-BOOT-001 — Initialize monorepo workspace
Create the workspace skeleton.

#### Includes
- root `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/extension`
- `apps/backend`
- `packages/shared-types`
- root `README.md`

#### Done when
- workspace installs cleanly
- each package has a valid package manifest
- root scripts exist for lint/typecheck/test

---

### BR-BOOT-002 — Add shared code quality tooling
Set up formatting, linting, and typechecking.

#### Includes
- ESLint
- Prettier or equivalent formatter
- TypeScript project references if used
- base test runner setup

#### Done when
- lint command exists and runs
- typecheck command exists and runs
- minimal test command exists and runs

---

### BR-CONTRACT-001 — Implement shared-types package
Create the public API contract package first.

#### Includes
- refresher mode enum/union
- request schema
- response envelope schema
- mode-specific data schemas
- public error schema
- health response schema
- package-level exports

#### Constraints
- schema-first where runtime validation matters
- no frontend UI types
- no backend internal pipeline types
- no PDF.js or DOM types

#### Done when
- backend and extension can both import shared contracts
- contract validation tests exist for main payload shapes

---

### BR-BACK-001 — Backend service skeleton + health endpoint
Create the backend shell before the business pipeline.

#### Includes
- app bootstrap
- typed central config layer
- `GET /api/health`
- strict CORS allowlist configuration hook
- structured logging foundation

#### Done when
- backend boots locally
- health route returns typed response shape
- startup config validation exists

---

### BR-EXT-001 — Extension shell + reader shell skeleton
Create the visible extension/reader skeleton without PDF rendering yet.

#### Includes
- MV3 manifest
- service worker entry
- reader entry page
- `ReaderApp`
- `ReaderLayout`
- `ReaderToolbar`
- `ReaderViewport`
- `ReaderOverlayHost`
- typed settings wrapper around `chrome.storage.local`

#### Done when
- extension loads in dev mode
- reader page opens
- toolbar and viewport render

## Notes
This epic is intentionally front-loaded because stable contracts and repo shape make later Codex tasks much more reliable.
