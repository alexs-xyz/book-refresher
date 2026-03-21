# Epic 03 — Safe Prefix Boundary

## Goal
Construct the spoiler-safe prefix that excludes all future text.

## Slices

### BR-BOUNDARY-001 — Boundary core structure
- `PageBoundaryResolver`
- `SelectedPagePrefixExtractor`
- `LocalContextExtractor`
- `SafePrefixBuilder`

### BR-BOUNDARY-002 — Earlier-page extraction
- `PdfTextExtractor`
- full text extraction from earlier pages
- light normalization only

### BR-BOUNDARY-003 — Selected-page prefix clipping
- derive page-local range from page start to selection end
- include selected text
- exclude later text on same page

### BR-BOUNDARY-004 — Unsupported-case handling
- reject multi-page selections
- reject selections outside text layer
- clear error guidance

### BR-BOUNDARY-005 — Validation with real PDFs
- confirm later text exclusion
- confirm earlier pages included in full
- test on several real PDFs

## Exit criteria
- valid single-page selections produce safe prefix
- later text is excluded from selected page
- unsupported cases fail clearly
