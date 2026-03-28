# Plan 0006 — Edge Cases and Hardening Execution

## Status
Ready for Codex implementation once the Milestone 3 and Milestone 4 entry gates are met.

## Goal
Execute Milestone 5 from `docs/planning/mvp-milestone-plan.md` as a dependency-gated hardening phase on top of the safe-prefix boundary path and the backend refresher pipeline, without pulling Milestone 6 release-prep work forward.

## Scope boundary vs backlog epic 05
- In scope for Milestone 5:
  - `BR-HARD-001` boundary error hardening
  - `BR-HARD-002` PDF noise control
  - `BR-HARD-003` retrieval quality tuning
  - `BR-HARD-004` request robustness
  - `BR-REL-001` curated PDF test set
- Defer to Milestone 6 even though they currently live in `backlog/epic-05-hardening-and-release.md`:
  - `BR-HARD-005` diagnostics and privacy-conscious logging
  - `BR-REL-002` MVP docs and readiness
- Rationale:
  - the milestone roadmap places diagnostics, full docs, and release-readiness work in Milestone 6 rather than Milestone 5
  - keeping those slices deferred prevents Milestone 5 from turning into a mixed hardening-plus-release-prep milestone

## Backlog slice review
- `BR-HARD-001` boundary error hardening
  - Correct first hardening slice after Milestone 3 lands.
  - It should build on the final safe-prefix path, not re-open in-flight boundary implementation work.
- `BR-HARD-002` PDF noise control
  - Correct Milestone 5 slice, but it must wait until the current extraction and normalization behavior stabilizes.
  - Otherwise hardening will fight moving Milestone 3 logic.
- `BR-HARD-003` retrieval quality tuning
  - Correct Milestone 5 slice, but fully blocked on a real Milestone 4 retrieval pipeline.
  - Tuning the current deterministic scaffold would create churn without improving the actual product.
- `BR-HARD-004` request robustness
  - Correct Milestone 5 slice, split naturally across frontend and backend.
  - Frontend owns duplicate suppression, timeout handling, and retry policy.
  - Backend owns request size limits, internal structured errors, and provider/pipeline timeout guards.
- `BR-REL-001` curated PDF test set
  - Should start early because it is the evaluation harness for the rest of the milestone.
  - Prefer fixture manifests and acquisition/generation instructions when redistributable PDFs are not available.

## Milestone 5 entry gates

### Gate A — Milestone 3 minimum complete
The following must be landed before Milestone 5 hardening work starts against the boundary path:
- `SafePrefixBuilder`, `PdfTextExtractor`, and `SelectedPagePrefixExtractor` are real and wired into request preparation
- boundary failures are typed and surfaced locally in the extension
- automated tests prove earlier-page inclusion and later-text exclusion on the selected page

### Gate B — Milestone 4 minimum complete
The following must be landed before Milestone 5 retrieval and request hardening begins:
- `POST /api/refresher` is backed by a real pipeline instead of deterministic scaffold responses
- frontend/backend integration can exercise `normal`, `sparse`, `ambiguous`, and `lowConfidence` against the real backend
- alias expansion, evidence extraction, and mode decision are stable enough to tune

### Work that can start before both gates
- fixture-selection strategy and validation rubric for `BR-REL-001`
- internal design of timeout, deduplication, and retry policy, as long as it does not force premature product-code changes

## Current repo assessment
- Milestone 3 is actively in flight in the current worktree:
  - `apps/extension/src/pdf/PdfTextExtractor.ts`
  - `apps/extension/src/selection/LocalContextExtractor.ts`
  - `apps/extension/src/selection/SafePrefixBuilder.ts`
  - `apps/extension/src/selection/SelectedPagePrefixExtractor.ts`
  - `apps/extension/src/tools/book-refresher/BookRefresherController.ts`
  - `apps/extension/src/tools/book-refresher/BookRefresherRequestBuilder.ts`
  - plus new local helpers for boundary errors and text normalization
- Milestone 4 is not yet hardening-ready in the committed baseline:
  - `apps/backend/src/services/refresher/refresher-service.ts` still returns deterministic scaffold responses
  - `apps/extension/src/api/ApiClient.ts` has no timeout, HTTP-status, retry, or malformed-response handling
  - the backend exposes only a generic public error envelope and no internal stage/error taxonomy
- Planning implication:
  - start with fixture and validation groundwork
  - then harden the real Milestone 3 and Milestone 4 seams after they land
  - do not plan Milestone 5 as if the current scaffold behavior were the target implementation

## Execution order

### Step 1 — Start `BR-REL-001` with a reusable hardening harness
Work:
- define a small representative fixture inventory:
  - one clean ebook-style PDF
  - one messier OCR/text PDF
  - one denser or less ideal PDF
- prefer a fixture manifest plus acquisition or generation instructions if raw PDFs cannot be committed safely
- define a validation matrix covering:
  - selection validity and boundary failures
  - repeated-noise behavior
  - output-mode behavior
  - ambiguity follow-up behavior
  - latency and error behavior

Definition of progress:
- the team has a stable test corpus and acceptance rubric before heuristic tuning starts

### Step 2 — Close `BR-HARD-001` after Milestone 3 lands
Work:
- finish boundary-time error mapping beyond selection-time validation:
  - empty or stale selection
  - failed page mapping
  - failed clipped extraction
  - outside-text-layer fallback
  - multi-page fallback
- surface these failures as popup-safe UI states before backend invocation
- keep boundary failure types local to the extension unless a backend-facing public error code becomes necessary
- add integration tests around controller and request-builder behavior for boundary failures

Definition of progress:
- unsupported or stale selections fail clearly and never degrade into generic network or popup errors

### Step 3 — Close `BR-HARD-004` around the end-to-end request path
Work:
- frontend:
  - add in-flight duplicate suppression keyed to active document and request intent
  - add timeout handling with `AbortController`
  - retry only for narrow transient failures, never for valid product outcomes such as `ambiguous` or `lowConfidence`
  - handle HTTP status failures and malformed or non-JSON responses cleanly
- backend:
  - introduce internal structured error classes with a consistent mapper to the existing public error envelope
  - add request size limits before expensive pipeline work
  - add provider and pipeline timeout guards without changing the stateless request model

Definition of progress:
- repeated clicks, slow providers, oversized requests, and transient failures produce controlled behavior instead of duplicate work or opaque errors

### Step 4 — Close `BR-HARD-002` once extraction and normalization are stable
Work:
- extend the extraction path with cheap recurring-noise reduction only where the curated fixture set shows clear value
- target obvious repeated headers, footers, and boilerplate
- preserve paragraph and line structure and avoid aggressive cleanup
- keep PDF-specific heuristics inside the extension extraction boundary

Definition of progress:
- repeated boilerplate is reduced on messy PDFs without deleting meaningful story text on clean PDFs

### Step 5 — Close `BR-HARD-003` after the real retrieval pipeline is landed
Work:
- tune representative-set caps using fixture-based comparisons
- tighten alias rules to reduce false positives while preserving high-value variants
- tune block-merge behavior and sparse-mode thresholds
- keep tuning deterministic and heuristic-driven rather than prompt-driven

Definition of progress:
- refresher quality is more stable across the curated fixture set and common entity-resolution cases

### Step 6 — Run the milestone verification sweep
Work:
- execute the curated fixture matrix end to end
- run targeted extension and backend tests for hardening behavior
- document residual unsupported PDF cases honestly
- confirm Milestone 6 items remain deferred

Definition of progress:
- Milestone 5 exit criteria are satisfied without absorbing release-prep scope

## Recommended pull request breakdown
Recommended sequence:
1. `BR-REL-001` fixture manifest and hardening harness
2. `BR-HARD-001` boundary hardening
3. `BR-HARD-004` request robustness
4. `BR-HARD-002` PDF noise control
5. `BR-HARD-003` retrieval quality tuning
6. Milestone 5 verification sweep

Rationale:
- the fixture corpus is the evaluation backbone for the milestone
- boundary hardening depends mostly on Milestone 3 and should land before network robustness and retrieval tuning
- request robustness becomes reviewable once the end-to-end path exists
- noise control and retrieval tuning should be evidence-driven, not speculative

## Out of scope for this plan
- `BR-HARD-005` diagnostics and privacy-conscious logging beyond minimal implementation-local debugging
- `BR-REL-002` full docs and MVP readiness work
- broad popup redesign or Milestone 6 UI polish
- multi-page support, scanned/image-only PDF support, or backend PDF parsing
- public contract renames or new shared fields unless a concrete blocker appears

## Main risks
- hardening against moving Milestone 3 and Milestone 4 targets creates rework
- noise filtering can remove story content if tuned before fixture coverage exists
- retrieval tuning is not meaningful while scaffold backend behavior remains in place
- copyrighted PDF fixtures may not be safe to commit

## Mitigations
- gate each hardening slice on the minimum upstream milestone behavior it depends on
- use fixture manifests and reproducible acquisition instructions where raw PDFs cannot be committed
- keep heuristics narrow, reversible, and covered by focused tests
- prefer internal error classes and mappers over public contract churn

## Verification commands for implementation turns
Expected commands:
- `pnpm --filter @book-refresher/extension typecheck`
- `pnpm --filter @book-refresher/extension test`
- `pnpm --filter @book-refresher/backend typecheck`
- `pnpm --filter @book-refresher/backend test`
- `pnpm typecheck`
- `pnpm test`

Manual fixture validation is still required for `BR-REL-001` and the final hardening sweep because the milestone is about reliability across document quality, not only unit behavior.
