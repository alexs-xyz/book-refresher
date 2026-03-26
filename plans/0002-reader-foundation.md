# Plan 0002 — Reader Foundation

## Status
Ready for Codex implementation.

## Goal
Complete Milestone 1 by turning the existing extension reader scaffold into a usable local PDF reading surface, without implementing selection tooling, safe-prefix construction, or backend refresher behavior.

## Source of truth
- `docs/planning/mvp-milestone-plan.md`
- `docs/architecture/technical-architecture.md`
- `docs/architecture/frontend-architecture.md`
- `backlog/epic-01-reader-foundation.md`

## Current repo reality
- The monorepo, backend skeleton, shared contracts package, and extension shell already exist.
- `apps/extension/src/pdf/PdfDocumentLoader.ts` only reads file bytes and does not create a real PDF.js document/session.
- `apps/extension/src/pdf/PdfSession.ts` returns a stub session with `pageCount: 0`.
- `apps/extension/src/pdf/PdfViewerAdapter.ts` is still a placeholder.
- `apps/extension/src/reader-app/ReaderViewport.tsx` still renders milestone placeholder content instead of PDF pages.
- `apps/extension/src/reader-app/ReaderToolbar.tsx` already includes backend health and scaffold refresher actions, which are later-milestone concerns and should not drive Milestone 1 scope.

## Scope
- wire PDF.js document loading for local files only
- implement the reader viewport so PDF pages render in the reader shell
- enable a selectable text layer
- support scrolling through the document
- support zoom controls
- display current page and total page count
- keep the extension thin and keep the reader page as the main runtime for document/viewer logic

## Non-goals
- no IndexedDB or other persistence beyond existing settings storage
- no auth, database, background jobs, or backend refactors
- no selection validation, popup flow, right-click trigger, or safe-prefix logic
- no shared contract expansion unless a real cross-boundary need appears
- no unrelated cleanup of backend/refresher scaffolding

## Boundary decisions
- Keep Milestone 1 changes inside `apps/extension` unless a concrete blocker proves otherwise.
- Treat `packages/shared-types` as unchanged for this slice because Milestone 1 is reader-local.
- Keep PDF.js details behind the `pdf/` module and do not leak low-level PDF.js types across the whole reader app.
- Preserve the thin extension / rich reader split: service worker opens the reader, the reader page owns file loading, viewer state, and toolbar interactions.

## Execution order

### Step 1 — Finish the PDF loading path
- expand `PdfDocumentLoader` from raw `ArrayBuffer` loading into a real PDF.js loading helper
- define a real `PdfSession` shape with document handle, fingerprint/runtime identity, page count, and file metadata needed by the reader
- keep document identity runtime-only

### Step 2 — Implement the viewer adapter
- replace the placeholder `PdfViewerAdapter` with a focused adapter around PDF.js viewer setup
- initialize rendering inside `ReaderViewport`
- ensure the text layer is enabled and selectable
- keep adapter responsibilities limited to viewer lifecycle, page refs, and viewer state hooks

### Step 3 — Wire the local file open flow into reader state
- update `ReaderApp` so opening a file creates a real session instead of a stub
- propagate loaded document state, page count, and ready/loading/error state into the reader shell
- keep document-loading errors local to the reader UI

### Step 4 — Complete reader controls
- update `ReaderToolbar` to show current page and total page count
- keep zoom state connected to the real viewer rather than a disconnected percentage label
- make page tracking respond to viewer scroll position
- keep later-milestone actions out of the critical Milestone 1 path

### Step 5 — Reader verification pass
- verify one local text-based PDF opens correctly
- verify the text layer is visible and selectable
- verify current page tracking updates while scrolling
- verify zoom changes the rendered view predictably
- verify the reader remains usable without backend availability

## Likely files to touch
- `apps/extension/src/pdf/PdfDocumentLoader.ts`
- `apps/extension/src/pdf/PdfSession.ts`
- `apps/extension/src/pdf/PdfViewerAdapter.ts`
- `apps/extension/src/reader-app/ReaderApp.tsx`
- `apps/extension/src/reader-app/ReaderViewport.tsx`
- `apps/extension/src/reader-app/ReaderToolbar.tsx`
- `apps/extension/src/reader-app/types.ts`
- `apps/extension/src/styles.css`

## Verification target
Milestone 1 is complete only when all of the following are true:
- a local PDF opens successfully in the reader
- pages render correctly
- the text layer is visible and selectable
- scrolling and zoom behave reliably
- current page display works
- the reader is stable enough to support Milestone 2 selection work

## Explicit doc mismatches
- `plans/0001-repo-bootstrap.md` keeps PDF rendering out of scope, but Milestone 1 requires a functioning PDF.js reader surface. This plan supersedes `0001` for reader work.
- `docs/planning/mvp-milestone-plan.md` says Milestone 1 should build the reader before fully wiring extension launch flow. The repo already has extension launch, backend scaffolding, shared contracts, and later-milestone placeholder modules. That repo state is ahead of the milestone order, but the remaining reader work still aligns with Milestone 1.
- `backlog/epic-01-reader-foundation.md` exit criteria require selectable text, page tracking, zoom, and scrolling reliability; the current placeholder `PdfViewerAdapter`, `PdfSession`, and `ReaderViewport` do not yet satisfy those criteria.

## Risks
- PDF.js viewer integration can sprawl if app code reaches directly into PDF.js internals.
- Current toolbar actions can blur milestone boundaries if backend/refresher controls are treated as part of reader completion.
- Page tracking and selectable text depend on the chosen viewer integration details and need empirical validation with a real text-based PDF.

## Mitigations
- keep the adapter boundary strict and push reader state upward through a narrow interface
- treat backend health and refresher controls as non-blocking scaffolding for this slice
- verify against a real local text PDF before considering Milestone 1 complete
