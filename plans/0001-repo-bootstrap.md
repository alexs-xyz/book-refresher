# Plan 0001 — Repo Bootstrap

## Status
Ready for Codex implementation.

## Goal
Stand up the minimum repo foundation that all later slices depend on.

## Scope
- monorepo workspace skeleton
- shared-types package
- backend skeleton with health endpoint
- extension shell + reader shell skeleton
- base lint/typecheck/test setup

## Why this is the right first plan
Without real packages, real commands, and real contracts, later Codex tasks will spend effort inventing structure instead of implementing features.

## Execution order

### Step 1 — Workspace skeleton
Create the repo structure and root workspace config.

### Step 2 — Shared contracts first
Implement `packages/shared-types` before building transport code.

### Step 3 — Backend skeleton
Create the backend app shell and `GET /api/health`.

### Step 4 — Extension shell
Create MV3 shell, reader entry page, and reader shell components.

### Step 5 — Tooling verification
Make lint/typecheck/test commands real and runnable.

## Out of scope
- PDF rendering
- selection handling
- refresher popup logic
- backend AI pipeline
- provider integration

## Deliverables
- installable workspace
- importable shared-types package
- backend health endpoint
- extension loads and opens reader shell
- documented commands in `README.md`

## Risks
- extension packaging/tooling choice can sprawl if not constrained
- shared-types package can become a dumping ground if not kept narrow

## Mitigations
- keep extension tooling boring and minimal
- enforce shared-type boundaries in `AGENTS.md`
