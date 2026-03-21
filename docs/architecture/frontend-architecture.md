# Book Refresher Frontend Architecture + Component Structure

## Project
Book Refresher

## Product Frame
Custom PDF.js-based browser reader with **Book Refresher** as the first integrated tool.

This document defines the frontend architecture and component structure for Book Refresher V1.

---

## 1. Purpose

The frontend is responsible for:
- presenting the custom PDF reader UI
- loading and rendering local PDFs via PDF.js
- handling text selection in the reader
- constructing the spoiler-safe prefix up to the selected boundary
- triggering the Book Refresher request flow
- rendering popup states for normal, sparse, ambiguous, low-confidence, and error cases
- integrating with the backend through a stable API client

The frontend is intentionally designed as a **reader platform** rather than as a one-off popup feature.

Book Refresher is tool #1 inside that platform.

---

## 2. Frontend Design Principles

### 2.1 Reader-First Architecture
The PDF reader is the primary surface. Tooling should layer on top of it rather than becoming tangled with the rendering core.

### 2.2 Thin Extension, Rich Reader
The extension layer should stay thin.

The reader page should own:
- DOM interaction
- PDF rendering integration
- selection handling
- popup logic
- API request assembly

### 2.3 Clear Separation of Concerns
The frontend should separate:
- extension/runtime concerns
- reader shell concerns
- PDF.js integration concerns
- selection and boundary concerns
- popup/tool concerns
- backend API concerns

### 2.4 Minimal Persistent State
V1 should persist settings/preferences, not long-term document or character memory.

### 2.5 Extensibility
The component structure should make it easy to add future reader tools without rewriting the core reader shell.

---

## 3. Chosen Frontend Shape

The frontend is split into two main layers:

### A. Extension Layer
Responsible for:
- extension bootstrap
- browser integration
- settings storage access
- launching/opening the reader entry point

### B. Reader Application Layer
Responsible for:
- app shell
- PDF.js viewer integration
- local file loading
- selection handling
- safe prefix construction
- Book Refresher popup flow
- backend communication

This follows the chosen MVP architecture of a thin extension/runtime layer and a richer reader page.

---

## 4. Top-Level Frontend Modules

The frontend should be organized into the following top-level module groups:

1. `extension/`
2. `reader-app/`
3. `pdf/`
4. `selection/`
5. `tools/book-refresher/`
6. `api/`
7. `state/`
8. `settings/`
9. `shared/`

---

## 5. Extension Layer Architecture

### 5.1 Responsibilities
The extension layer should remain intentionally small.

It should handle:
- service worker / runtime bootstrap
- extension manifest integration
- reader launch/open behavior
- settings access via `chrome.storage.local`
- optional context menu registration if needed at extension level later

### 5.2 Components
#### `extension/service-worker/`
Contains the extension service worker entry and lifecycle logic.

Responsibilities:
- startup wiring
- runtime listeners
- opening the reader entry point
- basic extension-level message handling if required

#### `extension/runtime/`
Contains extension runtime helpers.

Responsibilities:
- reader launch helpers
- environment/runtime utilities
- extension URL resolution helpers

#### `extension/storage/`
Thin wrapper around `chrome.storage.local`.

Responsibilities:
- read/write settings
- expose typed frontend settings access

### 5.3 Why This Layer Stays Thin
The service worker should not be the center of frontend business logic.

The visible reader page already has the DOM, the PDF, and the interaction flow. That is the correct home for the product logic.

---

## 6. Reader Application Architecture

### 6.1 Chosen Shape
The reader application is the main frontend runtime.

It should be structured as an app shell that hosts:
- toolbar/navigation UI
- document-loading UI
- PDF viewer surface
- overlay layer for popups and tool UI

### 6.2 Main Reader Areas

#### A. App Shell
Top-level reader frame and layout.

#### B. Viewer Area
PDF.js-backed rendering surface.

#### C. Overlay Area
Popup and modal/UI layers.

#### D. Tool Action Bridge
Selection-driven interaction layer between the viewer and Book Refresher.

---

## 7. PDF.js Integration Strategy

### 7.1 Chosen Strategy
Use PDF.js viewer capabilities/components as a base, but wrap them in a custom reader shell.

Book Refresher logic should remain outside core PDF.js logic as much as possible.

### 7.2 PDF Module Responsibilities
The `pdf/` module should own:
- PDF.js loader integration
- document loading from local files
- PDF document/session object creation
- page rendering integration
- text layer enablement
- page lookup and page metadata access
- utilities for extracting earlier page text

### 7.3 Recommended Internal Components
#### `pdf/PdfDocumentLoader`
Loads PDF data from file bytes / Blob / ArrayBuffer into PDF.js.

#### `pdf/PdfSession`
Holds the live document/session abstraction for the currently open PDF.

Responsibilities:
- document fingerprint/runtime identity
- page count
- loaded document handle
- page access methods

#### `pdf/PdfViewerAdapter`
Bridges the custom reader shell to PDF.js viewer behavior.

Responsibilities:
- initialize viewer
- manage render lifecycle
- expose page references
- expose text-layer access points

#### `pdf/PdfTextExtractor`
Handles page text extraction for earlier-page prefix construction.

Responsibilities:
- retrieve full text for earlier pages
- normalize page text lightly

### 7.4 Why Use an Adapter Layer
PDF.js should be treated as an integrated rendering dependency, not allowed to leak everywhere in the app.

The adapter layer protects the rest of the frontend from becoming tightly coupled to PDF.js internals.

---

## 8. Reader Shell Component Structure

### 8.1 Recommended Main Components

#### `reader-app/ReaderApp`
Top-level application component.

Responsibilities:
- app initialization
- composition of reader shell
- high-level state wiring

#### `reader-app/ReaderLayout`
Main layout wrapper.

Responsibilities:
- arrange toolbar, viewer, overlays
- handle shell-level responsiveness

#### `reader-app/ReaderToolbar`
Toolbar component.

Responsibilities:
- open file control
- page display
- zoom controls
- help/settings entry points

#### `reader-app/ReaderViewport`
Main visual reader area.

Responsibilities:
- host PDF viewer surface
- host anchored overlay system

#### `reader-app/ReaderOverlayHost`
Dedicated overlay layer.

Responsibilities:
- popup portal/root
- future modal/side-panel hosting
- visual layering management

---

## 9. Selection and Boundary Architecture

### 9.1 Design Goal
Selection handling must support:
- reading the user’s selected text
- identifying the selected page
- locating the popup anchor position
- building the safe prefix up to the selected boundary

### 9.2 Chosen Strategy
Use the rendered text layer selection / DOM Range as the source of truth on the selected page.

The frontend should not try to infer abstract PDF semantics beyond what the user selected in the viewer.

### 9.3 Selection Module Responsibilities
The `selection/` module should own:
- selection state detection
- selection validation
- selected page detection
- DOM range inspection
- selected-page prefix clipping
- local context extraction

### 9.4 Recommended Components
#### `selection/SelectionController`
Primary coordinator for selection state.

Responsibilities:
- listen to selection changes and tool triggers
- build validated selection state
- expose selection data to Book Refresher flow

#### `selection/SelectionStateBuilder`
Creates normalized selection state objects.

Responsibilities:
- selected text
- selected page
- validity status
- anchor rect
- selection range

#### `selection/SelectionValidator`
Validates supported/unsupported selection cases.

Examples:
- no text selected
- multi-page selection
- selection outside text layer

#### `selection/PageBoundaryResolver`
Associates a selection with a single page container.

#### `selection/SelectedPagePrefixExtractor`
Builds the selected-page prefix using the DOM range from the beginning of the page text layer to the end of the selected range.

#### `selection/LocalContextExtractor`
Extracts a small local context window around the selected text.

#### `selection/SafePrefixBuilder`
Combines:
- earlier-page text
- selected-page clipped prefix

into the final safe prefix payload.

### 9.5 Selection State Object
Recommended in-memory shape:
- `selectedText`
- `selectedPage`
- `selectionRange`
- `anchorRect`
- `localContext`
- `isValid`
- `invalidReason` if applicable

### 9.6 Why This Module Stays Separate
Selection/boundary logic is the most sensitive frontend logic because spoiler safety depends on it.

It should not be scattered across viewer and popup components.

---

## 10. Book Refresher Tool Architecture

### 10.1 Chosen Tool Shape
Book Refresher should be implemented as a self-contained tool module layered on top of the reader/selection system.

### 10.2 Tool Responsibilities
The `tools/book-refresher/` module should own:
- user trigger handling
- request preparation
- popup state transitions
- ambiguity follow-up flow
- backend call orchestration
- response-to-UI mapping

### 10.3 Recommended Components
#### `tools/book-refresher/BookRefresherController`
Main coordinator for the Book Refresher tool.

Responsibilities:
- receive valid selection input
- build refresher requests
- call API client
- control popup states
- handle ambiguity follow-up

#### `tools/book-refresher/BookRefresherRequestBuilder`
Builds the API request payload from selection/document state.

Responsibilities:
- request ID generation
- request object creation
- optional document metadata inclusion

#### `tools/book-refresher/BookRefresherModeMapper`
Maps backend response modes to UI presentation states.

#### `tools/book-refresher/BookRefresherPopup`
Primary anchored popup component.

Responsibilities:
- render normal mode
- render sparse mode
- render ambiguous mode
- render low-confidence mode
- render loading/error states

#### `tools/book-refresher/AmbiguityChoiceList`
UI for selecting among ambiguous candidates.

#### `tools/book-refresher/RefresherSummaryView`
Displays structured refresher content.

#### `tools/book-refresher/RefresherErrorView`
Displays low-confidence and hard-error states.

---

## 11. Popup and Overlay Architecture

### 11.1 Chosen UX Shape
The popup is the primary tool surface.

It should be:
- anchored near the selected text where possible
- repositioned when space is limited
- compact by default
- expandable later

### 11.2 Popup State Model
Popup states should be explicit and controlled, not inferred ad hoc.

Recommended popup modes:
- `hidden`
- `loading`
- `normal`
- `sparse`
- `ambiguous`
- `lowConfidence`
- `error`

### 11.3 Overlay Components
#### `reader-app/ReaderOverlayHost`
Global overlay mount point.

#### `tools/book-refresher/PopupAnchorManager`
Calculates final popup placement from selection anchor rect and viewport constraints.

#### `tools/book-refresher/BookRefresherPopup`
Renders the anchored popup itself.

### 11.4 Why Popup Logic Should Not Live Inside the Viewer
Popup/UI logic is tool behavior, not rendering behavior.

Keeping it outside the viewer layer avoids tight coupling and makes future tools easier to add.

---

## 12. API Integration Architecture

### 12.1 Design Goal
Keep backend communication isolated from the UI and tool components.

### 12.2 API Module Responsibilities
The `api/` module should own:
- backend base URL handling
- request sending
- response parsing
- API error normalization on the client side
- health-check helper if used in setup/dev flows

### 12.3 Recommended Components
#### `api/ApiClient`
Low-level HTTP client wrapper.

Responsibilities:
- request dispatch
- timeouts
- response parsing
- transport-level error normalization

#### `api/RefresherApi`
Business-specific API wrapper for Book Refresher.

Responsibilities:
- send `POST /api/refresher`
- send ambiguity follow-up requests with `chosenCandidateId`
- map raw HTTP responses into typed frontend results

#### `api/HealthApi`
Wrapper for `GET /api/health`

### 12.4 Recommended Client Flow
The Book Refresher controller should call `RefresherApi`, not `fetch()` directly.

This keeps UI code decoupled from transport details.

---

## 13. Frontend State Management

### 13.1 Chosen State Philosophy
Use simple local/app state with explicit controllers/services.

Do not introduce a heavy global state framework unless implementation later proves it necessary.

### 13.2 State Buckets
The frontend state should be split into these buckets:

#### A. Document Session State
- document ID
- file name
- page count
- loaded/not loaded
- PDF session reference

#### B. Viewer UI State
- current page display
- zoom level
- loading state
- viewer readiness

#### C. Selection State
- selected text
- selected page
- selection range
- anchor rect
- local context
- validity

#### D. Popup State
- visible/hidden
- popup mode
- loading flag
- current content payload
- current error payload

#### E. Settings State
- backend base URL
- feature flags
- optional UI preferences

### 13.3 Recommended State Placement
- local component state for purely visual ephemeral concerns
- controller-managed state for selection/tool flows
- typed settings store wrapper for persisted settings

### 13.4 What Not to Store in V1
Do not store persistent frontend memory for:
- character dossiers
- evidence blocks
- saved refreshers
- long-term book memory

This aligns with the chosen stateless request model.

---

## 14. Settings and Persistence

### 14.1 Chosen Persistence Model
Use `chrome.storage.local` for persistent settings/preferences only.

### 14.2 Stored Items in V1
Examples:
- backend base URL
- environment selection if needed
- feature flags
- help/onboarding dismissed state
- optional UI preferences

### 14.3 Not Stored in V1
Do not persist:
- per-character state
- per-document refresher results
- book memory caches

### 14.4 Frontend Settings Components
#### `settings/SettingsRepository`
Typed storage wrapper.

#### `settings/SettingsService`
Higher-level settings access for the app.

#### `settings/SettingsPanel` or `settings/SettingsEntry`
Minimal UI entry point if exposed in MVP polish.

---

## 15. Error Handling on the Frontend

### 15.1 Error Philosophy
Frontend should distinguish between:
- invalid or unsupported selection
- popup/tool errors
- backend response failures
- low-confidence business outcomes

### 15.2 Error Classes on the Frontend
Recommended client-side categories:
- `SelectionError`
- `BoundaryError`
- `ApiError`
- `PopupErrorState`

### 15.3 Error Display Rules
#### Selection / boundary errors
Show local user guidance without calling the backend when possible.

#### Backend/API errors
Show popup-safe error messaging with retry if appropriate.

#### Low-confidence outcomes
Treat as successful UI states, not failures.

### 15.4 Duplicate Click / Request Suppression
The frontend should prevent obvious duplicate request spam while a refresher request is already in flight for the same selection.

---

## 16. Frontend File / Folder Structure

A recommended structure for the frontend side:

```text
frontend/
  extension/
    service-worker/
    runtime/
    storage/
  reader-app/
    ReaderApp/
    ReaderLayout/
    ReaderToolbar/
    ReaderViewport/
    ReaderOverlayHost/
  pdf/
    PdfDocumentLoader/
    PdfSession/
    PdfViewerAdapter/
    PdfTextExtractor/
  selection/
    SelectionController/
    SelectionStateBuilder/
    SelectionValidator/
    PageBoundaryResolver/
    SelectedPagePrefixExtractor/
    LocalContextExtractor/
    SafePrefixBuilder/
  tools/
    book-refresher/
      BookRefresherController/
      BookRefresherRequestBuilder/
      BookRefresherModeMapper/
      BookRefresherPopup/
      AmbiguityChoiceList/
      RefresherSummaryView/
      RefresherErrorView/
      PopupAnchorManager/
  api/
    ApiClient/
    RefresherApi/
    HealthApi/
  state/
    document/
    viewer/
    selection/
    popup/
  settings/
    SettingsRepository/
    SettingsService/
    SettingsPanel/
  shared/
    types/
    utils/
    constants/
    errors/
```

This does not have to be followed literally, but the separation of concerns should remain close to this shape.

---

## 17. Recommended Frontend Flow

### 17.1 Normal Flow
1. User opens a local PDF in the reader.
2. PDF.js renders pages and text layer.
3. User selects text.
4. Selection controller validates the selection.
5. User right-clicks and triggers Book Refresher.
6. Safe prefix builder constructs:
   - earlier-page full text
   - selected-page clipped prefix
   - local context
7. Request builder creates the backend request.
8. API client sends the request.
9. Popup enters loading mode.
10. Backend response returns.
11. Mode mapper selects the correct popup rendering path.
12. Popup renders normal/sparse/ambiguous/low-confidence/error state.

### 17.2 Ambiguity Follow-Up Flow
1. Backend returns `mode=ambiguous`.
2. Popup shows candidate choices.
3. User selects one.
4. Controller sends the same request again with `chosenCandidateId`.
5. Popup returns to loading state.
6. Final result is rendered.

---

## 18. Recommended Initial Implementation Order

### Phase 1 — Reader Shell
- ReaderApp
- ReaderLayout
- ReaderToolbar
- ReaderViewport
- ReaderOverlayHost

### Phase 2 — PDF Integration
- PdfDocumentLoader
- PdfSession
- PdfViewerAdapter
- PdfTextExtractor

### Phase 3 — Selection Layer
- SelectionController
- SelectionStateBuilder
- SelectionValidator
- PageBoundaryResolver
- SelectedPagePrefixExtractor
- LocalContextExtractor
- SafePrefixBuilder

### Phase 4 — Book Refresher Tool
- BookRefresherController
- BookRefresherRequestBuilder
- BookRefresherPopup
- Mode mapper
- Summary/error/ambiguity views

### Phase 5 — API Integration
- ApiClient
- RefresherApi
- HealthApi

### Phase 6 — Settings and Polish
- SettingsRepository
- SettingsService
- SettingsPanel/help affordance
- duplicate request suppression
- UI polish/error handling

---

## 19. Known Deliberate Omissions in V1

The frontend deliberately does **not** include:
- persistent refresher caches
- per-character memory
- per-document long-term memory
- inline floating trigger UI as primary interaction
- place/object/faction tools
- advanced annotation system
- heavy global state framework
- broad PDF cleanup heuristics in the frontend

These omissions are intentional and aligned with the MVP scope.

---

## 20. Summary

The frontend architecture for Book Refresher V1 is built around a clear split:
- thin extension shell
- rich reader application
- PDF.js adapter layer
- isolated selection/boundary system
- self-contained Book Refresher tool module
- clean backend API integration

This structure keeps the MVP implementation practical while also setting up the reader as a platform for future tools beyond Book Refresher.

