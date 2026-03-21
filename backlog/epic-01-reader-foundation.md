# Epic 01 — Reader Foundation

## Goal
Establish a usable custom PDF reading surface before Book Refresher logic.

## Slices

### BR-READER-001 — Wire PDF.js loader
- install/configure PDF.js
- create `PdfDocumentLoader`
- create `PdfSession`

### BR-READER-002 — Implement viewer adapter
- create `PdfViewerAdapter`
- render pages in `ReaderViewport`
- enable text layer

### BR-READER-003 — Local file open flow
- file picker from toolbar
- load file bytes / Blob / ArrayBuffer
- create document session

### BR-READER-004 — Basic reader controls
- current page display
- page count display
- zoom controls
- scrolling reliability

### BR-READER-005 — Reader verification pass
- verify a local text-based PDF opens
- verify selectable text layer
- verify current page updates
- verify zoom/scroll behavior

## Exit criteria
- local PDF opens successfully
- pages render correctly
- text layer is visible and selectable
- scrolling and zoom behave reliably
- current page display works
