# Epic 02 — Selection and Popup Foundation

## Goal
Make the core interaction loop work with mocked states before real backend intelligence.

## Slices

### BR-SELECT-001 — Selection state core
- `SelectionController`
- `SelectionStateBuilder`
- `SelectionValidator`
- validated selection state shape

### BR-SELECT-002 — Page and anchor detection
- selected text extraction
- selected page detection
- anchor rect capture

### BR-POPUP-001 — Popup shell
- `BookRefresherPopup`
- `PopupAnchorManager`
- popup state model
- close/reposition behavior

### BR-TRIGGER-001 — Right-click trigger path
- right-click only
- valid-selection gating
- prevent empty/unsupported trigger

### BR-POPUP-002 — Mock states
- loading
- normal/mock success
- ambiguous
- lowConfidence
- error

## Exit criteria
- valid selection state updates correctly
- Book Refresher can be triggered from right-click
- popup anchors sensibly and consistently
- popup renders all main mock states
