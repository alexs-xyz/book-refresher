# Plan 0004 — Safe Prefix Boundary Execution

## Status
Ready for Codex implementation.

## Goal
Execute Milestone 3 from `docs/planning/mvp-milestone-plan.md` using the existing `phase/safe-prefix` GitHub issues as the source execution units, while keeping the scope limited to spoiler-safe prefix construction inside the extension reader.

## GitHub issue review
- `#17` `BR-BOUNDARY-001: Boundary core structure`
  - Correct dependency root for Milestone 3.
  - Current repo state: `PageBoundaryResolver` is already real and reused by `SelectionValidator`, but `SelectedPagePrefixExtractor` and `LocalContextExtractor` are placeholders, and `SafePrefixBuilder` only joins strings without boundary-aware validation.
- `#18` `BR-BOUNDARY-002: Earlier-page extraction`
  - Correctly scoped as the PDF-side half of the milestone.
  - Current repo state: `PdfSession` already holds a live `PDFDocumentProxy`, so the extraction dependency is present, but `PdfTextExtractor` is still a stub and no light-normalization behavior exists yet.
- `#19` `BR-BOUNDARY-003: Selected-page prefix clipping`
  - Correctly scoped as the spoiler-safety-critical half of the milestone.
  - Current repo state: `SelectionStateBuilder` already clones the live browser `Range`, but no code yet derives the page-local range from page start to selection end or proves that later page text is excluded.
- `#20` `BR-BOUNDARY-004: Unsupported-case handling`
  - Partially implemented already in the Milestone 2 selection foundation.
  - Current repo state: multi-page and outside-text-layer selections are rejected in `SelectionValidator`, but the boundary-building path still has no typed handling for page-start resolution failures, clipped extraction failures, or request-time boundary failures.
- `#21` `BR-BOUNDARY-005: Validation with real PDFs`
  - Must remain the final validation slice rather than a place to hide unfinished extraction work.
  - Current repo state: there are selection-state tests, but no safe-prefix tests yet that prove earlier-page inclusion and selected-page later-text exclusion.

## Milestone 3 constraints from docs
- Scope is limited to:
  - single-page selections only
  - full-text extraction from earlier pages
  - selected-page clipping from page start to selection end
  - inclusion of the selected text
  - full safe-prefix assembly
  - minimal normalization only
  - clean rejection of unsupported cases
- Do not add a developer-facing debug inspection tool in this milestone.
- Keep spoiler safety enforced by client-side boundary logic, not by backend prompt wording.
- Keep PDF.js extraction concerns inside `apps/extension/src/pdf/`.
- Keep selection and boundary orchestration inside `apps/extension/src/selection/` and `tools/book-refresher/`.
- Do not change shared request field names such as `selectedText`, `localContext`, or `prefixText` unless a concrete contract blocker appears.

## Current repo assessment
- Milestone 2 provides enough dependency foundation to start Milestone 3:
  - `SelectionController` tracks live reader selections.
  - `SelectionValidator` already gates multi-page and non-text-layer selections.
  - `ReaderViewport` owns the live PDF.js viewer DOM and exposes validated selection state from the reader root.
- Milestone 1 provides enough PDF infrastructure to support earlier-page extraction:
  - `PdfDocumentLoader`, `PdfSession`, and `PdfViewerAdapter` are already real.
  - `PdfSession` exposes the live `pdfDocument` handle needed for page text extraction.
- The actual Milestone 3 gaps are localized and clear:
  - `PdfTextExtractor` is a stub.
  - `SelectedPagePrefixExtractor` is a stub.
  - `LocalContextExtractor` is a stub.
  - `SafePrefixBuilder` is not yet a real boundary pipeline.
  - `BookRefresherRequestBuilder` still hard-codes `prefixText` and assumes `localContext` already exists.
- Popup and trigger work should not be pulled back into this plan:
  - popup rendering is still scaffold-level
  - right-click flow is a separate milestone concern
  - milestone-3 work should only wire boundary output into request preparation, not redesign the popup path

## Execution order

### Step 1 — Close `#17` with a request-time boundary assembly path
Finish the core boundary module shape without making selection updates expensive.

Work:
- keep `SelectionController` cheap and event-driven; do not perform page text extraction on every `selectionchange`
- define the boundary-building flow around a validated `SelectionState` plus the active `PdfSession`
- implement the real interfaces for:
  - `SelectedPagePrefixExtractor`
  - `LocalContextExtractor`
  - `SafePrefixBuilder`
- add extension-local boundary failure reasons for cases that occur after selection validation:
  - failed page-start resolution
  - failed clipped extraction
  - missing or unusable selection range at request time
- keep these failure types local to the extension rather than pushing them into `packages/shared-types`

Definition of progress:
- the reader has one clear internal path that can build boundary data from a valid selection on demand
- safe-prefix logic is separated from popup rendering and DOM event plumbing

### Step 2 — Close `#18` with real earlier-page extraction
Implement the PDF-side text extraction used for all pages before the selected page.

Work:
- implement `PdfTextExtractor` against the live `PDFDocumentProxy`
- extract earlier-page text in document order from page `1` through `selectedPage - 1`
- keep normalization light:
  - normalize whitespace
  - collapse obvious duplicate spaces
  - preserve line and paragraph structure where practical
- keep PDF.js-specific extraction and normalization utilities behind the `pdf/` module boundary

Definition of progress:
- boundary code can retrieve a stable earlier-pages prefix from the active PDF session
- no later-page text is involved in this extraction path

### Step 3 — Close `#19` by making selected-page clipping exact
Implement the selected-page prefix extraction from the beginning of the selected page to the end of the selected range.

Work:
- derive the selected page container and text-layer root from the validated range
- construct a page-local `Range` from the start of the page text layer to the end of the live selection range
- extract only the clipped selected-page prefix
- ensure the selected text is included in the clipped output
- ensure later text on the same page is excluded
- align normalization between `SelectedPagePrefixExtractor` and `PdfTextExtractor` so the assembled prefix is predictable

Definition of progress:
- valid single-page selections yield selected-page prefix text up to the exact selection end
- later text on the same page is excluded by construction rather than by prompt instructions

### Step 4 — Finish `#20` in the boundary and request path
Treat unsupported selection handling as an end-to-end boundary concern, not just a selection-controller concern.

Work:
- reuse the existing `SelectionValidator` results instead of duplicating selection gating
- extend boundary-time handling for failures that only show up during prefix construction
- update `BookRefresherRequestBuilder` to build real `prefixText` and `localContext` from the boundary pipeline instead of placeholder values
- ensure failed boundary construction stops before backend invocation and produces clear local guidance

Definition of progress:
- unsupported or failed boundary cases do not fall through to generic request errors
- request payload assembly uses real safe-prefix data without changing the shared API contract

### Step 5 — Close `#21` with focused automated and manual validation
Validate the milestone with tests that directly target spoiler-safety behavior.

Work:
- add unit tests for:
  - `PdfTextExtractor`
  - `SelectedPagePrefixExtractor`
  - `SafePrefixBuilder`
  - request-builder or controller integration around real `prefixText` and `localContext`
- add DOM-based tests that prove:
  - earlier-page text is included
  - selected text is included
  - later text on the same page is excluded
- run manual validation on representative real PDFs without introducing a user-facing debug tool
- if the popup trigger flow is still incomplete, validate through a focused test harness or boundary-focused test path rather than broadening milestone scope

Definition of progress:
- milestone exit criteria are demonstrated directly in tests and manual reader validation
- the safe prefix is stable enough to feed the backend pipeline in a later milestone

## Recommended pull request breakdown
Recommended sequence:
1. PR for `#17`
2. PR for `#18`
3. PR for `#19`
4. PR for `#20`
5. PR for `#21`

Recommended consolidation if issue overhead needs to be reduced:
1. PR for `#17` + `#19`
2. PR for `#18`
3. PR for `#20`
4. PR for `#21`

Rationale:
- `#17` defines the boundary-building seam and should land before request wiring depends on it
- `#18` is a clean PDF extraction slice once the seam exists
- `#19` is the critical spoiler-boundary implementation and should stay reviewable on its own unless paired with `#17`
- `#20` should verify that the boundary pipeline fails clearly, not just that selection validation exists
- `#21` should confirm finished behavior rather than mix in implementation work

## Out of scope for this plan
- multi-page safe-prefix support
- any backend-side PDF parsing or boundary reconstruction
- popup redesign, right-click trigger redesign, or general Milestone 2 completion work
- heavy PDF cleanup or recurring-noise filtering beyond minimal normalization
- a developer-facing boundary inspection tool
- shared contract renames or broader backend pipeline changes unless a concrete blocker is discovered

## Main risks
- PDF.js text extraction order may not perfectly match rendered text-layer DOM order on every PDF
- clipped DOM-range extraction can become brittle if it depends on unstable text-layer markup assumptions
- request-time boundary building can fail if the stored selection range becomes stale after rerender or zoom changes
- normalization can accidentally erase too much structure if it is implemented independently in multiple places

## Mitigations
- keep selected-page clipping sourced from the live cloned DOM `Range`, since that is the user-visible boundary source of truth
- centralize light normalization helpers so earlier-page and selected-page paths stay consistent
- validate range ancestry and page ownership again at request time before building the prefix
- keep failure mapping explicit and local so unsupported PDFs fail clearly instead of leaking future text or sending partial garbage to the backend

## Verification commands for implementation turns
Run the smallest relevant set during each slice, then broader checks when the phase is complete.

Expected commands:
- `pnpm --filter @book-refresher/extension typecheck`
- `pnpm --filter @book-refresher/extension test`
- `pnpm --filter @book-refresher/extension build`
- `pnpm typecheck`
- `pnpm test`

Manual PDF validation is still required for `#21` because spoiler-safety acceptance depends on real rendered documents, not only unit coverage.
