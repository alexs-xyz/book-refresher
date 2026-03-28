# Plan 0005 — Backend Refresher Pipeline Execution

## Status
Ready for staged Codex implementation.

## Goal
Execute Milestone 4 from `docs/planning/mvp-milestone-plan.md` as a staged backend-first plan that respects the current reality of the repo: the public request/response contract already exists, milestone-four scaffolding already exists, and Milestone 3 safe-prefix work is still active in the workspace.

## Epic slice review
- `BR-API-001` `Refresher route shell`
  - Mostly scaffolded already.
  - Current repo state: `apps/backend/src/routes/refresher.ts` validates the public schema and returns a typed response, but the route still jumps directly into a single deterministic service method and has only minimal route coverage.
- `BR-PIPE-001` `Pipeline skeleton`
  - Correct dependency root for the real backend implementation.
  - Current repo state: `apps/backend/src/services/refresher/refresher-service.ts` is a single placeholder method; there is no explicit controller, request validator, response mapper, or staged pipeline seam yet.
- `BR-PIPE-002` `Candidate resolution`
  - Partially implied by placeholder rules, but not implemented as a real stage.
  - Current repo state: ambiguity, low-confidence, and chosen-candidate behavior are hard-coded heuristics inside `RefresherService`; there is no candidate model, no chosen-candidate validation, and no cheaper-model adapter.
- `BR-PIPE-003` `Alias expansion and retrieval`
  - Not implemented yet.
  - Current repo state: there is no alias expansion module, explicit-alias search, or retrieval logic over `prefixText`.
- `BR-PIPE-004` `Evidence extraction and selection`
  - Not implemented yet.
  - Current repo state: there is no evidence-block extractor, no merge/deduplicate step, and no representative-set selector.
- `BR-PIPE-005` `Output mode decision`
  - Present only as a placeholder behavior.
  - Current repo state: `sparse`, `ambiguous`, and `lowConfidence` are triggered by simplistic deterministic rules rather than evidence-aware thresholds.
- `BR-PIPE-006` `Provider abstraction`
  - Not implemented yet.
  - Current repo state: backend config exists for host/port/CORS only; there is no `AiProvider`, `ProviderFactory`, or provider-specific config surface.
- `BR-PIPE-007` `Final generation`
  - Not implemented yet.
  - Current repo state: normal/sparse output text is placeholder copy in `RefresherService`; there is no final evidence-driven generation stage.
- `BR-INTEG-001` `Frontend/backend integration`
  - Transport scaffolding already exists.
  - Current repo state: `ApiClient`, `RefresherApi`, `BookRefresherController`, and `BookRefresherRequestBuilder` already exist, but the popup still depends on mocked/scaffold behavior and the backend is not yet real.

## Milestone 4 constraints from docs
- Scope is limited to:
  - one public `POST /api/refresher` endpoint
  - shared schema-first request/response validation
  - rules-first entity checking with cheaper-model fallback only when needed
  - conservative alias expansion
  - explicit-alias retrieval only
  - one evidence block per hit in V1
  - merge/deduplicate before ranking
  - representative evidence selection across earliest, middle, and recent mentions
  - explicit `normal`, `sparse`, `ambiguous`, and `lowConfidence` product outcomes
  - popup-ready structured responses
- The backend stays stateless in V1.
- The backend does not parse the original PDF in V1.
- Provider secrets remain backend-only.
- Do not introduce wildcard CORS.
- Do not rename shared contract fields such as `selectedText`, `selectedPage`, `localContext`, `prefixText`, or `chosenCandidateId`.

## Additional constraint from the current workspace
- Milestone 3 boundary work is active in the working tree right now:
  - `PdfTextExtractor`
  - `SelectedPagePrefixExtractor`
  - `LocalContextExtractor`
  - `SafePrefixBuilder`
  - related boundary helpers
- Treat Milestone 3 implementation details as an in-flight dependency, not a stable target for refactors.
- Milestone 4 should therefore start with backend-only work that consumes the existing request contract and fixture inputs.
- The live reader cutover should happen only after Milestone 3 tests and request-building behavior are stable enough to trust `prefixText` and `localContext`.

## Current repo assessment
- The contract boundary is already strong enough to start Milestone 4:
  - `packages/shared-types` already exports the refresher request/response schemas
  - backend route validation is live
  - frontend API client and request builder already target the shared schema
- The backend has real scaffolding but not real pipeline behavior:
  - the route is real
  - the response modes are real contract variants
  - the internal logic is still placeholder-only
- The frontend already has the right seam for later integration:
  - `BookRefresherRequestBuilder` builds shared-contract requests
  - `BookRefresherController` already delegates to `RefresherApi`
  - this means backend slices can be developed and tested without waiting for popup polish
- The main sequencing risk is overlap with Milestone 3:
  - backend work should not keep changing what the frontend request builder expects
  - frontend integration should not be used to hide unfinished backend stages

## Execution order

### Step 1 — Close `BR-API-001` and `BR-PIPE-001` with a real backend seam
Turn the existing deterministic route/service scaffold into a clean staged backend entry point.

Work:
- keep `POST /api/refresher` as the only public business endpoint
- introduce explicit internal seams such as:
  - request validation/input normalization
  - orchestration/controller
  - response mapping
  - pipeline-stage composition
- keep the route thin and schema-first
- add backend tests that exercise the route with fixture requests and assert the public envelope shape
- do not try to make the responses intelligent in this step; preserve current behavior behind better structure first

Definition of progress:
- the route no longer depends on a monolithic placeholder method
- Milestone 4 work has one clear composition seam for later stages
- fixture-based route tests lock the contract before the intelligent pipeline is added

### Step 2 — Close `BR-PIPE-006` early with provider abstraction and config
Create the provider boundary before candidate resolution and final generation start depending on it.

Work:
- add `AiProvider` and `ProviderFactory`
- define typed backend config for provider choice, model names, and required secrets
- keep provider-specific SDK details behind adapters
- add a deterministic fake/test provider for unit tests
- keep all provider secrets backend-only

Definition of progress:
- later stages can depend on provider interfaces instead of raw SDK calls
- backend tests can cover model-using stages without hitting real providers

### Step 3 — Close `BR-PIPE-002` with real candidate resolution
Replace the current placeholder heuristics with a real rules-first candidate-resolution stage.

Work:
- implement rules-first checks over `selectedText` and `localContext`
- add chosen-candidate validation so `chosenCandidateId` is accepted only when it matches a previously surfaced candidate set
- fall back to the cheaper model only when the rules-first stage cannot confidently decide
- keep `ambiguous` and `lowConfidence` as product outcomes, not generic failures
- keep this stage independent from later retrieval/generation logic where possible

Definition of progress:
- the backend can distinguish normal, ambiguous, and low-confidence candidate outcomes using a real staged decision path
- chosen-candidate follow-up is validated rather than blindly trusted

### Step 4 — Close `BR-PIPE-003`, `BR-PIPE-004`, and `BR-PIPE-005` with fixture-driven retrieval
Implement retrieval, evidence shaping, and mode decision without waiting on live reader integration.

Work:
- implement conservative alias expansion
- search `prefixText` for explicit alias mentions only
- do not retrieve globally on pronouns
- build one local evidence block per hit using the planned practical block strategy
- merge overlapping or nearby blocks before ranking
- select a representative evidence set with earliest, middle, and recent coverage
- decide `normal` vs `sparse` from evidence volume/quality thresholds rather than LLM output
- add backend unit tests against fixed prefix fixtures so the stage behavior is reviewable without the frontend

Definition of progress:
- the backend can turn a valid candidate into a constrained evidence set
- sparse-mode decisions are deterministic and evidence-aware

### Step 5 — Close `BR-PIPE-007` with final generation and response mapping
Add the final evidence-driven generation stage after retrieval and mode decision are stable.

Work:
- use the better model only for the final refresher generation step
- generate `normal` and `sparse` outputs from the selected evidence set
- keep ambiguity and low-confidence mapping outside the final-generation path
- add explicit response-mapping tests so the public envelope stays stable
- preserve statelessness; do not add caching or persistence

Definition of progress:
- normal and sparse responses are generated from real evidence instead of placeholder text
- the public response envelope remains stable across all product modes

### Step 6 — Close `BR-INTEG-001` only after Milestone 3 request building is stable
Cut the reader over from scaffolded behavior to the real backend only after the boundary pipeline is trustworthy.

Work:
- wire `BookRefresherController` and popup flows to the real backend responses
- support ambiguity follow-up requests using `chosenCandidateId`
- keep boundary-construction failures local to the extension and stop them before backend invocation
- validate the real request flow using the live `BookRefresherRequestBuilder` once Milestone 3 tests are green
- only at this step should end-to-end reader validation become a milestone acceptance gate

Definition of progress:
- a valid reader selection can produce a real backend refresher end to end
- ambiguity follow-up works through the live popup/request flow
- Milestone 4 no longer depends on scaffold response behavior

## Recommended pull request breakdown
Recommended sequence:
1. PR for `BR-API-001` + `BR-PIPE-001`
2. PR for `BR-PIPE-006`
3. PR for `BR-PIPE-002`
4. PR for `BR-PIPE-003` + `BR-PIPE-004` + `BR-PIPE-005`
5. PR for `BR-PIPE-007`
6. PR for `BR-INTEG-001`

Rationale:
- the route and composition seam should stabilize before intelligent logic starts landing
- provider abstraction should land before multiple stages depend on model access
- candidate resolution is easier to review before retrieval and generation are added
- retrieval/evidence/mode decision are tightly coupled and should be reviewed together
- final generation should land only after upstream evidence selection is already stable
- frontend cutover should be the last step so Milestone 3 overlap does not thrash backend work

## Out of scope for this plan
- backend-side PDF parsing or boundary reconstruction
- multi-page selection support
- broader popup redesign or reader UX polish beyond what live integration requires
- recurring PDF noise filtering beyond what Milestone 3 already produces
- persistent character memory, caching, or background summarization
- wildcard CORS or relaxed secret handling

## Main risks
- Milestone 3 may keep changing `prefixText`/`localContext` quality while backend retrieval tuning is underway
- candidate resolution can become over-dependent on the model if rules-first heuristics are underspecified
- evidence extraction can accidentally over-merge blocks and lose chronology
- final-generation prompts can drift away from the exact evidence set if response mapping is not explicit

## Mitigations
- keep backend retrieval tests driven by fixed contract fixtures even while frontend boundary work is still moving
- make rules-first checks the default path and use the cheaper model only for narrow uncertainty cases
- keep merge/deduplicate logic explicit and test chronology-preserving representative-set selection
- map each product outcome explicitly before the final-generation stage so ambiguity and low-confidence never fall through to fabricated summaries

## Verification commands for implementation turns
Run the smallest relevant set during each slice, then broader checks when the milestone is complete.

Expected commands:
- `pnpm --filter @book-refresher/shared-types test`
- `pnpm --filter @book-refresher/backend test`
- `pnpm --filter @book-refresher/backend typecheck`
- `pnpm --filter @book-refresher/backend build`
- `pnpm --filter @book-refresher/extension test`
- `pnpm --filter @book-refresher/extension typecheck`
- `pnpm typecheck`
- `pnpm test`

Milestone acceptance still needs live reader validation after Step 6, because fixture-driven backend tests alone cannot prove the real request path from selection to popup.
