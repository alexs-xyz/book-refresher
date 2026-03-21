# Epic 04 — Backend Refresher Pipeline

## Goal
Deliver the first real end-to-end Book Refresher flow.

## Slices

### BR-API-001 — Refresher route shell
- `POST /api/refresher`
- request validation
- typed response envelope

### BR-PIPE-001 — Pipeline skeleton
- `RefresherController`
- `RefresherRequestValidator`
- `ResponseMapper`

### BR-PIPE-002 — Candidate resolution
- rules-first heuristics
- cheap-model fallback for uncertainty
- chosen-candidate validation path

### BR-PIPE-003 — Alias expansion and retrieval
- conservative aliases only
- explicit alias search only
- no pronoun retrieval

### BR-PIPE-004 — Evidence extraction and selection
- paragraph-first / fallback-window hybrid
- one block per hit in V1
- merge and deduplicate
- earliest/middle/recent representative set

### BR-PIPE-005 — Output mode decision
- sparse threshold logic
- no LLM-based mode decision

### BR-PIPE-006 — Provider abstraction
- `AiProvider`
- `ProviderFactory`
- typed config
- first provider adapter

### BR-PIPE-007 — Final generation
- final refresher generation
- normal, sparse, ambiguous, lowConfidence mapping

### BR-INTEG-001 — Frontend/backend integration
- `ApiClient`
- `RefresherApi`
- `HealthApi`
- `BookRefresherRequestBuilder`
- ambiguity follow-up with `chosenCandidateId`

## Exit criteria
- end-to-end refresher works for at least one normal case
- ambiguous and lowConfidence flows work
- sparse mode works
- popup renders real backend responses
