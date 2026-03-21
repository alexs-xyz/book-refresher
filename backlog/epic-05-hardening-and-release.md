# Epic 05 — Hardening and Release Prep

## Goal
Make the MVP reliable, explainable, and runnable by another developer.

## Slices

### BR-HARD-001 — Boundary error hardening
- empty selection
- multi-page selection
- text-layer failures
- page mapping failures
- clipped extraction failures

### BR-HARD-002 — PDF noise control
- cheap repeated boilerplate filtering
- repeated header/footer noise reduction
- preserve structure as much as possible

### BR-HARD-003 — Retrieval quality tuning
- representative-set caps
- alias false-positive tuning
- sparse threshold tuning

### BR-HARD-004 — Request robustness
- duplicate request suppression
- timeout handling
- retry behavior
- request size limits
- structured error classes

### BR-HARD-005 — Diagnostics and privacy-conscious logging
- request IDs end to end
- pipeline timings
- mode-level outcome logging
- avoid excessive raw text logging

### BR-REL-001 — Curated PDF test set
- one good ebook-style PDF
- one messier OCR/text PDF
- one denser/less ideal PDF

### BR-REL-002 — MVP docs and readiness
- setup/run guide
- repo navigation doc
- backend API usage doc
- supported PDF limitations doc
- contributor workflow notes
- troubleshooting notes
- release/readiness checklist

## Exit criteria
- expected failures are clear and contained
- common PDFs behave acceptably for MVP
- another developer can run the project from docs
- MVP readiness checklist is satisfied
