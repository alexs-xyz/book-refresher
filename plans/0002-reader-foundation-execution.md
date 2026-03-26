# Plan 0002 — Reader Foundation Execution

## Status
Ready for Codex implementation.

## Goal
Execute the `phase/reader-foundation` GitHub issues in an order that matches `docs/planning/mvp-milestone-plan.md` Milestone 1 and the repo's current starting point.

## GitHub issue review
- `#7` `BR-READER-001: Wire PDF.js loader`
  - Correctly scoped as the foundation slice.
  - Current repo state: `apps/extension/src/pdf/PdfDocumentLoader.ts` and `apps/extension/src/pdf/PdfSession.ts` exist, but they are still placeholder-level abstractions and do not yet hold a live PDF.js document/session.
- `#8` `BR-READER-002: Implement viewer adapter`
  - Correctly scoped and currently the biggest technical gap.
  - Current repo state: `apps/extension/src/pdf/PdfViewerAdapter.ts` and `apps/extension/src/reader-app/ReaderViewport.tsx` are explicit placeholders.
- `#9` `BR-READER-003: Local file open flow`
  - Correctly scoped, but partially scaffolded already.
  - Current repo state: the toolbar file input exists, but it only creates metadata via `createPdfSession(file)` and does not open a live PDF.js document into the reader surface.
- `#10` `BR-READER-004: Basic reader controls`
  - Correctly scoped, but partially scaffolded already.
  - Current repo state: zoom buttons and page labels exist, but `currentPage` is hard-coded and zoom is not connected to a real viewer.
- `#11` `BR-READER-005: Reader verification pass`
  - Correctly scoped as a final validation slice.
  - This should remain a verification issue, not a place to hide unfinished implementation work from `#7` through `#10`.

## Milestone 1 constraints from docs
- Keep the reader as a custom PDF.js-based surface, not the stock PDF.js viewer UI.
- Keep PDF.js concerns inside the `pdf/` module behind adapter-style boundaries.
- Milestone 1 scope is limited to:
  - local PDF file loading
  - page rendering
  - text-layer rendering and selection
  - scrolling
  - zoom
  - current page display
- Build the reader surface first before fully wiring extension-launch and Book Refresher flows.

## Current repo assessment
- The repo already contains the right module boundaries for Milestone 1:
  - `apps/extension/src/pdf/`
  - `apps/extension/src/reader-app/`
- The implementation is still pre-Milestone-1 in the core render path:
  - reader viewport is a placeholder
  - PDF.js loader/session/viewer code is not yet real
  - current page and zoom state are not derived from an actual viewer
- The reader shell currently exposes later-phase scaffold controls (`Health`, `Scaffold refresh`) that are outside Milestone 1 acceptance. They do not need to be removed immediately, but they should not drive the implementation plan or acceptance criteria for reader-foundation work.

## Execution order

### Step 1 — Close `#7` by making `pdf/` real
Implement the actual PDF.js loading/session boundary first.

Work:
- expand `PdfDocumentLoader` to load a `File` into PDF.js
- configure the PDF.js worker inside the `pdf/` module only
- expand `PdfSession` to hold the live document handle, runtime identity/fingerprint, page count, page access helpers, and teardown lifecycle
- keep React components unaware of PDF.js internals beyond the session/adapter boundary

Definition of progress:
- a local PDF can be turned into a live session object
- page count is real, not placeholder state
- the loader/session layer is stable enough for the viewer adapter to consume

### Step 2 — Close `#8` by implementing the viewer adapter
Build the actual render path on top of the loader/session boundary.

Work:
- implement `PdfViewerAdapter` as the bridge between `ReaderViewport` and PDF.js
- render pages inside the custom reader viewport
- enable the text layer so browser selection works on rendered text
- expose page container references and viewer lifecycle hooks needed by later milestones without pulling selection logic into this slice

Definition of progress:
- pages render in the custom reader surface
- rendered text is selectable
- PDF.js remains isolated behind `pdf/`

### Step 3 — Close `#9` by completing the local file open flow
Turn the existing toolbar file control into a real reader-session flow.

Work:
- replace metadata-only file handling in `ReaderApp` with async load/session creation
- connect the file picker to the real loader/session and viewer adapter lifecycle
- clean up any prior session before opening a new file
- surface load failures cleanly in the reader UI

Definition of progress:
- selecting a local PDF from the toolbar opens it in the reader
- the reader state reflects the actual file and actual page count

### Step 4 — Close `#10` by wiring real reader controls
Connect page/zoom controls to the live viewer.

Work:
- replace the hard-coded current page display with viewport-driven tracking
- connect zoom controls to the adapter/viewer render lifecycle
- keep scrolling behavior native and stable; avoid premature complexity
- if later-phase toolbar actions add confusion during acceptance, hide or clearly separate them from Milestone 1 controls

Definition of progress:
- current page updates from actual reading position
- zoom changes affect the rendered document reliably
- scrolling remains stable enough for reading

### Step 5 — Close `#11` with a verification pass
Use this issue only after `#7` through `#10` are already implemented.

Work:
- run the reader against a real local text-based PDF
- verify:
  - local PDF opens successfully
  - pages render correctly
  - text layer is visible and selectable
  - scrolling works reliably
  - zoom works reliably
  - current page display updates correctly
- update docs that currently describe the render path as scaffold-only once the reader is genuinely working

Definition of progress:
- Milestone 1 exit criteria are demonstrated directly
- remaining degraded-PDF limitations are documented honestly rather than hidden

## Recommended pull request breakdown
Recommended sequence:
1. PR for `#7`
2. PR for `#8`
3. PR for `#9`
4. PR for `#10`
5. PR for `#11`

Rationale:
- `#7` is the clean dependency root
- `#8` is easiest to review once the session boundary is stable
- `#9` becomes straightforward once the viewer can consume a real session
- `#10` depends on a working viewer, not just a shell
- `#11` should validate finished behavior, not mix in feature work

If issue overhead needs to be reduced, the only reasonable consolidation is:
- PR 1: `#7`
- PR 2: `#8` + `#9`
- PR 3: `#10`
- PR 4: `#11`

## Out of scope for this plan
- right-click Book Refresher invocation
- popup behavior beyond preserving the overlay host
- safe-prefix construction
- backend integration
- contract changes in `packages/shared-types`

## Main risks
- `pdfjs-dist` worker setup in Vite/MV3 can sprawl if configuration leaks outside `pdf/`
- text-layer setup can couple React components directly to PDF.js DOM details if the adapter boundary is not enforced
- current-page tracking can feel unstable if based on naive scroll events instead of a clear page-visibility rule
- later-phase scaffold controls in the toolbar can confuse Milestone 1 acceptance if not treated as non-goals

## Mitigations
- keep worker bootstrapping and PDF.js imports inside `apps/extension/src/pdf/`
- make `ReaderViewport` a host surface, not a PDF.js implementation dump
- choose one explicit current-page rule during `#10` and keep it deterministic
- treat `docs/setup/local-development.md` and any reader placeholder copy as required follow-up edits during `#11`

## Verification commands for implementation turns
Run the smallest relevant set during each implementation slice, then the broader workspace checks when the phase is complete.

Expected commands:
- `pnpm --filter @book-refresher/shared-types build`
- `pnpm --filter @book-refresher/extension typecheck`
- `pnpm --filter @book-refresher/extension test`
- `pnpm --filter @book-refresher/extension build`
- `pnpm typecheck`
- `pnpm test`

Manual verification is still required for `#11` because Milestone 1 acceptance includes reader behavior that is difficult to prove with source-only checks.
