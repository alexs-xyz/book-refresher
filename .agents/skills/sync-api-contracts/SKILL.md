---
name: sync-api-contracts
description: Use this when changing request/response shapes, shared enums, or API behavior that affects both backend and extension. Keep the shared-types package as the single public contract boundary and update all dependents together.
---

# Sync API Contracts

## Goal
Change public contracts deliberately and keep the extension and backend in sync.

## Required process
1. Start in `packages/shared-types`.
2. Update schema-first definitions before updating consumers.
3. Update exports.
4. Update backend validation/parsing/mapping.
5. Update extension API client and UI mode handling.
6. Update tests and example fixtures where applicable.
7. Report every downstream consumer touched.

## Things that belong in shared-types
- refresher request/response contracts
- public mode enums/unions
- public error shape
- health response shape
- optional small ID aliases and candidate choice types

## Things that do not belong in shared-types
- DOM types
- PDF.js types
- popup positioning/UI-local state
- backend pipeline internals
- provider-specific SDK models

## Breaking-change discipline
Treat these as deliberate breaking changes:
- renaming request fields
- changing response envelope semantics
- changing mode names or meaning
- removing `chosenCandidateId`
- changing public error shape

## Done when
- shared package compiles/tests
- backend compiles/tests against updated contracts
- extension compiles/tests against updated contracts
- docs/backlog references are updated when behavior changed
