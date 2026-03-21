# Repository Structure + Codex Workflow

## Goal
Turn the current documentation set into a repo shape that Codex can work with predictably.

This file standardizes the docs into a monorepo layout, explains the chosen Codex workflow, and records a few implementation recommendations that were not explicitly locked by the product docs.

## Why this standardization is needed
The current docs are aligned on the product and architecture, but they use slightly different structural viewpoints:
- the shared-types spec assumes a monorepo with `apps/extension`, `apps/backend`, and `packages/shared-types`
- the frontend doc shows a frontend-internal module structure under a `frontend/` root

These are not fundamentally in conflict.

The adopted convention for implementation is:
- monorepo at the repo root
- frontend-internal module structure lives inside `apps/extension`
- backend lives inside `apps/backend`
- public contracts live inside `packages/shared-types`

## Chosen repository shape
```text
book-refresher/
  apps/
    extension/
      src/
        extension/
        reader-app/
        pdf/
        selection/
        tools/
          book-refresher/
        api/
        state/
        settings/
        shared/
      public/
      manifest.config.ts
      package.json
      tsconfig.json
      vite.config.ts
    backend/
      src/
        app/
        config/
        controllers/
        routes/
        services/
        providers/
        domain/
        logging/
        errors/
      test/
      package.json
      tsconfig.json
  packages/
    shared-types/
      src/
        api/
        common/
        index.ts
      package.json
      tsconfig.json
  docs/
    product/
    architecture/
    planning/
    codex/
  backlog/
  plans/
  .agents/
    skills/
  AGENTS.md
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  README.md
```

## Recommended concrete stack
The docs constrain architecture strongly, but they do not fully lock the implementation stack. The following is the recommended default because it is simple, TypeScript-native, and works well with Codex in a monorepo.

### Workspace
- `pnpm` workspaces
- no Turborepo initially unless build complexity later justifies it

### Extension / reader app
- React
- Vite
- Manifest V3 extension packaging
- PDF.js
- local state/controllers rather than a heavy global state framework
- Vitest

### Backend
- Node.js + TypeScript
- Fastify
- typed central config layer
- provider adapter boundary
- Vitest

### Shared contracts
- Zod schema-first contracts
- exported inferred TypeScript types

## Why these choices
- `pnpm` workspaces keep the repo simple while handling three packages cleanly.
- React + Vite is a low-friction fit for a UI-heavy reader shell.
- Fastify fits the thin stateless API shape and plays well with typed schemas.
- Zod directly matches the shared-types specification.

## Codex operating model
Use Codex as a repo-aware implementer, not as a one-shot code generator.

### Persistent repo guidance
Keep durable rules in `AGENTS.md`.

### Reusable workflows
Keep recurring workflows in `.agents/skills/`.

### Unit of execution
Use one backlog slice at a time.

### Planning rule
For medium or large changes, create a plan file in `plans/` first, then implement.

### Isolation rule
Use worktrees or separate branches/threads for parallel work.

## Recommended task flow with Codex
1. pick a single backlog slice
2. point Codex to the relevant docs
3. ask for a short plan first if the slice is non-trivial
4. implement only that slice
5. run lint/typecheck/tests
6. review the diff
7. merge or iterate

## Prompt shape that tends to work well
Use prompts shaped like this:

```text
Read:
- docs/architecture/frontend-architecture.md
- docs/planning/mvp-milestone-plan.md
- backlog/epic-01-reader-foundation.md

Implement only slice BR-EXT-001.
Constraints:
- do not touch backend code
- do not add new production dependencies unless necessary
- keep PDF.js concerns inside the pdf module
- update tests if behavior changes

When done:
- run lint, typecheck, and relevant tests
- report exact commands run and results
- list any doc mismatches found
```

## What not to do with Codex
- do not ask it to "build the whole app" from the PRD
- do not let it change contracts casually
- do not allow broad refactors during feature work
- do not let it decide MVP scope on its own
- do not skip verification just because the diff looks plausible

## First execution recommendation
Start with repo bootstrap and shared contracts, then reader foundation.

That means:
1. workspace setup
2. `packages/shared-types`
3. extension shell + reader shell skeleton
4. PDF.js render path
5. page/zoom/selectable text verification

This order makes Codex more reliable because later feature prompts can target real files and stable contracts instead of building from air.


## Starter scaffold added

The repo now also contains a runnable starter skeleton:
- root workspace files (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`)
- `apps/backend` with `GET /api/health` and stubbed `POST /api/refresher`
- `apps/extension` with MV3 background bootstrap and reader page shell
- `packages/shared-types` with schema-first public API contracts

Use this scaffold as the baseline and implement backlog slices incrementally rather than regenerating the entire repo each time.
