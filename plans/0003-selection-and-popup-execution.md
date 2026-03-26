# Plan 0003 — Selection and Popup Execution

## Status
Ready for Codex implementation.

## Goal
Execute Milestone 2 from `docs/planning/mvp-milestone-plan.md` using the existing `phase/selection-popup` GitHub issues as the source execution units, while keeping the scope limited to frontend reader interaction work with mocked popup behavior only.

## GitHub issue review
- `#12` `BR-SELECT-001: Selection state core`
  - Correct dependency root for Milestone 2.
  - Current repo state: `SelectionController`, `SelectionStateBuilder`, and `SelectionValidator` exist, but they return hard-coded placeholder values and do not observe live reader selections.
- `#13` `BR-SELECT-002: Page and anchor detection`
  - Tightly coupled with `#12`.
  - Current repo state: selected text, selected page, and popup anchor data are not derived from the rendered PDF.js text layer yet.
- `#14` `BR-POPUP-001: Popup shell`
  - Correctly scoped after selection state is real.
  - Current repo state: `BookRefresherPopup` renders static placeholder content and `PopupAnchorManager` only returns a bottom-right fallback style.
- `#15` `BR-TRIGGER-001: Right-click trigger path`
  - Depends on validated selection state and a usable popup shell.
  - Current repo state: no right-click trigger path exists in the reader.
- `#16` `BR-POPUP-002: Mock popup states`
  - Should remain focused on mocked UI states and not pull backend work forward.
  - Current repo state: popup rendering exists, but it is not wired to reader selection or a controlled trigger flow.

## Milestone 2 constraints from docs
- Scope is limited to:
  - detect selection state inside the reader
  - capture selected text
  - capture selected page
  - validate whether selection is usable
  - capture popup anchor position
  - support Book Refresher trigger through right-click only
  - build popup shell with mocked states
- Do not integrate the real backend yet.
- Keep the reader page as the owner of DOM interaction, selection handling, and popup logic.
- Keep PDF.js specifics behind adapter-style boundaries rather than scattering them across the reader app.

## Current repo assessment
- The repo already has the right module boundaries for Milestone 2:
  - `apps/extension/src/selection/`
  - `apps/extension/src/tools/book-refresher/`
  - `apps/extension/src/reader-app/`
- Milestone 2 is not implemented yet in the actual interaction path:
  - selection modules are placeholders
  - popup anchor logic is a placeholder
  - the reader does not track live selection state
  - the reader does not expose a right-click-only trigger
- Later-milestone scaffolding already exists:
  - safe-prefix and backend-integration files are present
  - those files should not drive Milestone 2 acceptance

## Execution order

### Step 1 — Close `#12` and `#13` together with a real selection foundation
Implement live selection tracking from the rendered reader surface and validate it against the current PDF.js text-layer DOM.

Work:
- replace placeholder selection scaffolding with live `SelectionController` state management
- normalize selected text from the browser selection
- capture the current DOM `Range`
- resolve the selected page from the owning PDF.js page container
- capture a popup anchor rect from the current selection
- validate unsupported local cases early:
  - empty selection
  - collapsed selection
  - selection outside the reader
  - selection outside the PDF.js text layer
  - selection spanning multiple pages
- wire the reader app to receive live validated selection state

Why these issues are paired:
- a validated selection state is not reviewable or useful without the page and anchor data Milestone 2 depends on
- splitting them in the repo's current placeholder state would create an artificial intermediate type that still could not support the next popup slice

Definition of progress:
- reader selection changes update a real in-memory selection state
- valid single-page reader selections include selected text, selected page, and anchor rect
- invalid selections are clearly gated before any popup or trigger logic runs

### Step 2 — Close `#14` with the popup shell
Build the anchored popup container on top of the real selection foundation.

Work:
- replace the fixed fallback popup placement with selection-aware placement plus viewport fallback
- flesh out popup shell structure, close behavior, and reposition behavior
- keep the popup shell backend-agnostic in this step

Definition of progress:
- popup can appear near the selection or move to a safe visible fallback position
- popup open/close state is controlled predictably by reader state

### Step 3 — Close `#15` with the right-click-only trigger
Introduce the reader interaction path that opens Book Refresher only from right-click on a valid selection.

Work:
- wire a context-menu or reader-owned right-click trigger path
- gate the trigger on the validated selection state
- prevent empty, unsupported, or stale selections from opening the tool

Definition of progress:
- Book Refresher can only be triggered from right-click on a valid reader selection
- invalid selections do not open the popup shell

### Step 4 — Close `#16` with mocked popup states
Exercise the interaction loop end to end without calling the real backend.

Work:
- add mocked popup states for:
  - loading
  - normal
  - ambiguous
  - lowConfidence
  - error
- keep ambiguity as a product outcome, not a generic error
- avoid introducing real API calls in this milestone

Definition of progress:
- popup renders all main Milestone 2 states cleanly
- the interaction loop is stable enough to move into safe-prefix work

## Recommended pull request breakdown
Recommended sequence:
1. PR for `#12` + `#13`
2. PR for `#14`
3. PR for `#15`
4. PR for `#16`

Rationale:
- real selection state is the dependency root for the rest of the milestone
- popup placement should be reviewed independently of trigger policy
- right-click gating is easier to review once the popup shell already exists
- mocked states should be layered onto a stable shell rather than mixed into state-foundation work

## Out of scope for this plan
- safe-prefix construction and earlier-page extraction
- backend request flow or provider calls
- shared contract changes unless a concrete cross-boundary blocker appears
- full ambiguity follow-up request handling
- release-polish UI refinements beyond what Milestone 2 needs

## Main risks
- PDF.js text-layer DOM shape may vary enough that selection validation needs to be defensive
- browser selection events can report stale or non-reader selections if the controller is not root-scoped
- popup anchor placement can feel unstable if it relies only on a single raw rect without viewport fallback

## Mitigations
- validate selections against the reader root and `.textLayer` ancestry explicitly
- clone and normalize the live `Range` when building selection state
- keep popup fallback placement separate from selection capture so invalid anchors do not break the tool shell

## Verification commands for implementation turns
Run the smallest relevant set during each slice, then broader checks when the phase is complete.

Expected commands:
- `pnpm --filter @book-refresher/extension typecheck`
- `pnpm --filter @book-refresher/extension test`
- `pnpm --filter @book-refresher/extension build`
- `pnpm typecheck`
- `pnpm test`
