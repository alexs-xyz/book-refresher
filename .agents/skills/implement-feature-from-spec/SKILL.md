---
name: implement-feature-from-spec
description: Use this when asked to implement a specific feature or backlog slice that already has supporting docs. Read only the relevant docs, restate the scope, preserve architectural boundaries, implement narrowly, and finish with verification.
---

# Implement Feature From Spec

## Goal
Turn a documented slice into a reviewable implementation without drifting from the agreed architecture.

## Required process
1. Identify the exact slice or task.
2. Read the smallest relevant set of docs.
3. State the scope and explicit non-goals.
4. Implement only the requested slice.
5. Update tests/docs only where the change requires it.
6. Run lint, typecheck, and relevant tests.
7. Report exact commands and results.

## Read order
- `AGENTS.md`
- relevant `backlog/*.md` file
- the smallest necessary docs under `docs/`
- any nearby code in the target package

## Boundary checks
Before editing, check:
- does this task change public contracts?
- does this task cross frontend/backend/shared-types boundaries?
- does this task risk violating spoiler-safety assumptions?
- is the task large enough that a `plans/*.md` update is needed first?

## Hard rules
- do not broaden scope on your own
- do not add unrelated refactors
- do not invent API fields not present in shared contracts
- do not move UI-local or backend-internal types into `packages/shared-types`
- do not introduce persistent memory/database/queue infrastructure in MVP

## Output format
When done, report:
- what changed
- files changed
- commands run
- results
- any doc mismatch or unresolved edge case
