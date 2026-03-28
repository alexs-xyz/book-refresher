# Plan 0007 — MVP Release Prep Execution

## Status
Planning-ready now.

Implementation should start only after Milestone 5 has been implemented and verified.

## Goal
Execute Milestone 6 from `docs/planning/mvp-milestone-plan.md` as a separate release-prep milestone that packages the hardened reader and refresher system into a coherent MVP without pulling unfinished Milestone 5 hardening work forward.

## Scope boundary vs backlog epic 05
- In scope for Milestone 6:
  - `BR-HARD-005` diagnostics and privacy-conscious logging
  - `BR-REL-002` MVP docs and readiness
  - practical UI / UX polish for the reader and popup
  - configuration and environment setup
  - lightweight in-product help
- Explicitly out of scope until Milestone 5 is complete:
  - `BR-HARD-001` boundary error hardening
  - `BR-HARD-002` PDF noise control
  - `BR-HARD-003` retrieval quality tuning
  - `BR-HARD-004` request robustness
  - `BR-REL-001` curated PDF test set as a hardening harness
- Rationale:
  - Milestone 5 is the dependency-gated reliability phase
  - Milestone 6 is the packaging, observability, documentation, and presentability phase
  - `backlog/epic-05-hardening-and-release.md` still groups some of this work together, so this plan is the source of truth for milestone execution order

## Current sequencing reality
- Milestone 3 is almost complete but still finishing the safe-prefix path
- Milestone 4 implementation is in progress
- Milestone 5 has an execution plan but no started implementation
- Planning implication:
  - Milestone 6 planning should happen now
  - Milestone 6 code changes should wait until Milestone 5 exits cleanly
  - only low-churn artifacts such as readiness checklists, doc outlines, and slice definitions should start early

## Milestone 6 entry gates

### Gate A — Milestone 5 complete
The following should be landed before Milestone 6 implementation work starts:
- boundary hardening is complete and verified
- request robustness is complete across frontend and backend
- PDF noise control and retrieval tuning are validated against the curated fixture set
- the Milestone 5 verification sweep is complete and remaining limitations are documented honestly

### Gate B — Stable end-to-end product behavior
The following should be true before polish and release-prep work becomes implementation-ready:
- the Milestone 4 live frontend/backend path is the default behavior rather than scaffold responses
- popup states for `normal`, `sparse`, `ambiguous`, `lowConfidence`, and real failures are stable enough to polish rather than redesign
- backend provider/config surfaces are stable enough to document and expose through minimal settings

### Work that can start before the gates
- define the MVP readiness checklist and manual validation script
- outline user-facing and contributor-facing documentation
- design logging taxonomy and timing fields without landing product-code changes yet
- sketch settings/help surface copy and placement
- identify any missing backlog slices if Milestone 6 work cannot be expressed cleanly via the existing epic

## Milestone 6 slice map
- `BR-POL-001` Reader and popup polish
- `BR-CONFIG-001` Configuration and environment setup
- `BR-HARD-005` Diagnostics and privacy-conscious logging
- `BR-REL-002` MVP docs and readiness
- `BR-HELP-001` Lightweight in-product help

These labels are planning aids for Milestone 6 execution. They separate release-prep work cleanly even though the current backlog still packages some of it inside epic 05.

## Current repo assessment
- The architecture docs already support most Milestone 6 boundaries:
  - frontend settings belong in the thin extension plus reader shell, not inside PDF.js internals
  - backend config should stay in a typed central config layer with backend-only secrets
  - request IDs, public error envelopes, and outcome modes already exist as architectural concepts
- The main blocker is sequencing, not missing direction:
  - Milestone 3 is still closing the safe-prefix implementation
  - Milestone 4 is still establishing the real backend pipeline
  - Milestone 5 has not yet hardened those seams
- Planning implication:
  - Milestone 6 should avoid speculative redesign
  - release-prep work should polish and document the real system that emerges from Milestones 4 and 5

## Execution order

### Step 1 — Lock the Milestone 6 acceptance contract
Work:
- turn Milestone 6 scope into reviewable implementation slices
- define the MVP readiness checklist and manual validation rubric
- lock the supported setup flow, supported PDF profile, and explicit non-goals that the release docs must reflect

Definition of progress:
- release-prep work can be implemented without reopening scope debates

### Step 2 — Close `BR-CONFIG-001` with a real configuration surface
Work:
- finish or tighten the typed backend config surface for environment, provider, model, and CORS settings
- expose backend URL configuration and any minimal frontend settings only where they map to real runtime behavior
- provide example configuration and local run expectations
- keep provider secrets backend-only and avoid wildcard CORS

Definition of progress:
- another developer can configure and launch the system locally without code spelunking

### Step 3 — Close `BR-HARD-005` with privacy-conscious diagnostics
Work:
- ensure request IDs are visible across reader and backend logs
- add frontend error classification and backend stage timing logs
- track final outcome mode at a coarse level without logging raw spoiler-heavy document text
- map internal failures to clear user-facing messaging and retry guidance

Definition of progress:
- failures and slow paths are debuggable without weakening privacy or changing the public contract unnecessarily

### Step 4 — Close `BR-POL-001` and `BR-HELP-001`
Work:
- refine popup sizing, spacing, anchored placement, and visual association with the current selection
- tighten loading, empty, ambiguity, low-confidence, and error states
- add minimal settings/help entry points within the existing reader shell
- add a short first-use hint or lightweight help surface for:
  - select text
  - right-click
  - choose Book Refresher
- keep polish inside the reader shell and popup layers rather than reopening PDF.js integration design

Definition of progress:
- the product feels coherent and self-explanatory without changing Milestone 5 behavior

### Step 5 — Close `BR-REL-002` with full MVP documentation
Work:
- finish setup/run instructions
- document architecture and module structure at a practical level
- document API usage, supported PDF limitations, known limitations, troubleshooting, contributor workflow, and configuration
- align docs with the actual implemented behavior rather than planned future behavior

Definition of progress:
- a new developer can run, understand, and debug the project from docs alone

### Step 6 — Run the MVP readiness sweep
Work:
- execute install, launch, typecheck, test, and manual reader-flow checks
- validate the curated fixture set results using the Milestone 5 harness
- verify the docs by following them against the real setup flow
- record any remaining limitations and explicit post-MVP deferrals honestly

Definition of progress:
- Milestone 6 exit criteria are satisfied and the MVP is ready to present or hand off

## Recommended pull request breakdown
Recommended sequence:
1. readiness checklist and Milestone 6 slice scaffolding
2. `BR-CONFIG-001`
3. `BR-HARD-005`
4. `BR-POL-001` + `BR-HELP-001`
5. `BR-REL-002`
6. MVP readiness sweep and cleanup

Rationale:
- readiness criteria should be locked before polish and documentation land
- config and diagnostics are foundational for both setup docs and debugging
- UI polish should happen after the hardened behaviors are stable enough to present
- full docs should describe the actual shipped flows, not transient implementation details

## Out of scope for this plan
- any unfinished Milestone 5 hardening work
- multi-page selection support
- backend-side PDF parsing
- support for scanned or image-only PDFs
- public-release auth, billing, analytics pipelines, or persistent character memory
- major reader redesign beyond practical polish
- casual shared-contract renames unless a concrete blocker appears

## Main risks
- polishing against unstable Milestone 5 behavior will create churn
- logging can drift into capturing too much raw document text
- docs written too early will reflect planned behavior rather than shipped behavior
- settings surfaces can leak backend-only concerns into the extension

## Mitigations
- keep Milestone 6 implementation gated on Milestone 5 verification
- log identifiers, stage metadata, and outcome classes rather than raw prefix text
- write outlines early, but finalize user-facing docs only after the real flows stabilize
- keep provider secrets and sensitive config backend-only behind the typed config layer

## Verification commands for implementation turns
Expected commands once Milestone 6 implementation begins:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @book-refresher/extension build`
- `pnpm --filter @book-refresher/backend build`

Manual setup verification, popup-flow checks, and curated fixture validation are still required because Milestone 6 is about MVP readiness, not only automated correctness.
