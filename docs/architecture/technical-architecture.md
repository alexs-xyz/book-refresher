# Technical Architecture Specification

## Project
Book Refresher

## Product Frame
Custom PDF.js-based browser reader with **Book Refresher** as the first tool.

---

## 1. System Overview

### 1.1 Purpose
This document defines the technical architecture for Book Refresher V1.

The system is a browser-based PDF reader built on PDF.js. Its first integrated tool is Book Refresher, which allows a user to highlight a character name in a PDF, right-click, and request a spoiler-safe refresher generated only from the text up to the exact selected boundary.

### 1.2 Technical Goals
- own the PDF viewing surface instead of depending on a browser-native PDF viewer
- support precise enough text selection and boundary capture for spoiler-safe processing
- keep the system simple and predictable for an MVP
- avoid proactive background summarization or persistent per-character memory
- remain provider-agnostic at the backend model layer
- establish a modular reader platform that can support additional tools later

### 1.3 High-Level Architecture
The system consists of four main parts:

1. **Extension Layer**
   - installs into the browser
   - provides entry points and settings
   - launches the custom reader

2. **Reader Application**
   - custom browser-based reader UI
   - loads and renders PDFs via PDF.js
   - owns selection handling, popup overlays, and tool invocation

3. **Backend API**
   - receives self-contained refresher requests
   - performs entity resolution, alias expansion, evidence retrieval, and final summary generation

4. **LLM Provider Layer**
   - provider-agnostic abstraction
   - uses cheaper models for low-cost reasoning steps and better models for final refresher generation

### 1.4 Architectural Principles
- **Spoiler safety by data boundary**: later text must never be sent to the backend
- **Reader-first UX**: viewer interaction remains primary, tool invocation remains lightweight
- **Stateless request model**: each refresher request should be self-contained
- **Minimal persistence**: V1 stores settings, not persistent character memory
- **Extensibility**: Book Refresher is tool #1 in a broader reader platform

---

## 2. Frontend / Extension Architecture

### 2.1 Runtime Split
The browser extension uses a thin background/runtime layer and a richer reader page.

#### Thin extension layer responsibilities
- extension installation/bootstrap
- settings storage and retrieval
- optional context menu registration if used at extension level
- launching/opening the custom reader experience
- message routing where needed

#### Reader page responsibilities
- PDF rendering via PDF.js
- document navigation
- selection detection
- boundary capture
- popup rendering
- request packaging and backend communication
- local in-session state management

### 2.2 Why This Split
The reader page already has:
- access to the DOM
- access to the PDF text layer
- direct knowledge of page-level viewer state
- direct control over overlays and user interaction

This makes it the correct place for almost all Book Refresher logic in V1.

### 2.3 Settings Storage
Use `chrome.storage.local` for:
- backend API base URL
- feature flags
- selected model/provider config if exposed in settings later
- UI preferences

Do not add IndexedDB in V1 unless implementation later requires it for a concrete need.

### 2.4 In-Session State
The reader page may maintain temporary runtime state in memory for:
- current document metadata
- current selection
- selected page number
- current popup state
- in-flight refresher request state
- current error/loading states

This state is session-local and not required to persist across reloads.

---

## 3. PDF.js Viewer Shell Design

### 3.1 Chosen Viewer Strategy
Use a hybrid approach:
- start from PDF.js viewer capabilities/components
- wrap them inside a custom app shell
- keep Book Refresher logic outside core PDF.js internals as much as possible

### 3.2 Shell Structure
The reader shell is divided into four logical layers:

#### A. Application Shell
Responsible for:
- top toolbar
- document title
- page navigation controls
- zoom controls
- future tool slots
- settings entry point

#### B. PDF Viewer Surface
Responsible for:
- rendering pages
- text layer
- scrolling
- zooming
- page positioning

#### C. Selection and Tool Bridge
Responsible for:
- detecting selection changes
- detecting right-click interactions
- mapping selection to page context
- initiating Book Refresher requests

#### D. Overlay Layer
Responsible for:
- compact popup display
- ambiguity dialogs
- loading states
- error states
- expanded views later

### 3.3 Shell Boundaries
The viewer shell should clearly separate:
- **document rendering concerns** from
- **tool invocation concerns** from
- **AI/backend communication concerns**

This prevents Book Refresher from becoming tightly coupled to PDF rendering internals.

### 3.4 Reader Navigation Features Required for V1
Minimum reader features:
- open a PDF file
- render all pages correctly
- scroll through document
- select text
- know current page position
- right-click selected text
- show popup overlay

Anything beyond this should only be added if it directly supports Book Refresher.

---

## 4. Document Loading Flow

### 4.1 Chosen Loading Strategy
V1 loads documents from local file data.

Primary loading path:
- local file -> Blob / ArrayBuffer -> PDF.js loader

### 4.2 Why This Path
This path keeps the document loading model predictable and avoids early complexity around:
- CORS
- remote authentication
- cross-origin PDF access
- inconsistent URL behaviors

### 4.3 Future Extensibility
The loading layer should be designed behind an abstraction so a URL-based loading path can be added later.

### 4.4 Proposed Loader Abstraction
Introduce a document loader interface with one current implementation and room for later extension.

#### Example conceptual interface
- `loadFromFile(file)`
- future: `loadFromUrl(url)`

Both should normalize into a common internal document source object.

### 4.5 Document Identity
Each opened PDF should receive a temporary runtime identifier based on stable document metadata where possible.

Potential sources:
- file name
- file size
- generated fingerprint
- PDF.js-provided metadata/fingerprint if usable

This identifier is primarily used to tag requests and UI state, not to build long-term persistence in V1.

---

## 5. Boundary Capture Design

### 5.1 Goal
Construct a safe text prefix that includes:
- all text before the selected page
- text on the selected page only up to and including the selected text boundary

### 5.2 Chosen Boundary Strategy
Use the DOM selection / Range in the rendered PDF.js text layer as the source of truth for the selected page boundary.

This is intentionally simple and aligned to the user-visible text layer.

### 5.3 Boundary Construction Model
The safe prefix is built from two parts:

#### Part A: Earlier Pages
For all pages before the selected page:
- extract full page text using the standard PDF.js text extraction path
- normalize and concatenate in document order

#### Part B: Selected Page
For the selected page:
- inspect the browser selection / Range inside the rendered text layer
- determine the page container owning the selection
- construct a page-local range from the beginning of the page text layer to the end of the selected range
- extract only this prefix portion

### 5.4 Boundary Inclusion Rule
The selected text itself must be included.

The cutoff uses the **end of the selected range** rather than the start.

### 5.5 Selected Page Determination
The selected range must be associated with exactly one page for V1.

If the selection spans multiple pages, V1 should treat that as unsupported and request the user to make a smaller selection.

### 5.6 Boundary Capture Steps
1. User selects text.
2. User invokes Book Refresher.
3. Reader page inspects current browser selection.
4. Reader resolves which page contains the selection.
5. Reader extracts full text for all earlier pages.
6. Reader extracts page-local prefix text for the selected page using the DOM range.
7. Reader concatenates earlier page text and selected-page prefix.
8. Reader sends this safe prefix to the backend.

### 5.7 Normalization Rules
Before sending prefix text to the backend, apply lightweight normalization:
- normalize whitespace
- remove obvious duplicate spacing artifacts
- preserve basic paragraph/line boundary information where possible
- avoid aggressive cleanup that could distort the original text order

### 5.8 Unsupported or Degraded Boundary Cases
The system should explicitly detect and handle:
- empty selection
- multi-page selection
- selection outside recognized text-layer DOM
- failure to map selection to page container

Fallback behavior:
- show user-facing error
- ask user to select a smaller or clearer text region

### 5.9 Technical Validation Note
Boundary handling is a known technical risk area and should be validated empirically with real book PDFs during implementation.

---

## 6. Backend API and Mention-Retrieval Pipeline

### 6.1 Backend Responsibilities
The backend is responsible for:
- validating requests
- entity checking
- alias expansion
- mention retrieval from prefix text
- evidence block assembly
- evidence ranking and pruning
- final refresher generation
- returning structured popup-ready output

### 6.2 Request Model
Each request is self-contained.

#### Required request fields
- `documentId`
- `selectedText`
- `selectedPage`
- `prefixText`
- `localContext`
- optional document metadata such as title or filename

### 6.3 Statelessness
The backend should not depend on persistent per-character history for correctness.

Each request should be processable independently.

### 6.4 Pipeline Overview
1. input validation
2. entity check
3. alias expansion
4. mention search
5. evidence block construction
6. block merge and deduplication
7. evidence ranking
8. output mode selection (normal vs sparse)
9. final refresher generation
10. response packaging

### 6.5 Step 1: Input Validation
Validate:
- non-empty selected text
- non-empty prefix text
- reasonable size limits
- selected page is valid
- local context is present when expected

If invalid:
- return structured error

### 6.6 Step 2: Entity Check
Determine whether the selected text likely refers to a character.

This should follow a rules-first, model-second approach.

#### Rules-first stage
Use lightweight heuristics such as:
- capitalization patterns
- name-like token structure
- surrounding local context
- exact repetition in earlier prefix text
- simple title-based patterns (`Mr.`, `Mrs.`, `Dr.`, etc.)

#### Model-second stage
Call the cheaper model only when rules are insufficient or confidence is low.

#### Possible outputs
- confident character match
- ambiguous character candidates
- low-confidence / unsupported selection

### 6.7 Step 3: Alias Expansion
Build a candidate alias set for the resolved character.

Examples:
- surname only
- title + surname
- full name
- short name

Alias expansion should remain conservative.

Do not perform global pronoun retrieval.

### 6.8 Step 4: Mention Search
Search the safe prefix text for explicit alias matches only.

This stage should identify candidate occurrences and map them to retrievable local text blocks.

### 6.9 Step 5: Evidence Block Construction
Use the standard practical handling for local text blocks.

For V1:
- use one local text block per hit
- do not attempt scene stitching or multi-block continuation inference
- keep extraction simple and stable

### 6.10 Step 6: Merge and Deduplicate Blocks
Before ranking:
- merge overlapping blocks
- merge nearby duplicate blocks when they are effectively the same evidence region
- remove redundant blocks

### 6.11 Step 7: Evidence Ranking
Do not take all matching blocks.

Construct a representative set that favors:
- earliest defining mentions
- recent mentions
- a small set of middle mentions for diversity

This prevents overrepresentation of very frequent characters.

### 6.12 Step 8: Output Mode Selection
Determine whether enough evidence exists for:
- normal refresher mode
or
- sparse-context mode

Sparse mode triggers when:
- too few usable evidence blocks exist
or
- total evidence volume is too small for a rich refresher

### 6.13 Step 9: Final Refresher Generation
Use the better model for the final visible refresher.

Input to the final model should include only:
- resolved character identity
- alias set
- selected text
- local selection context
- ranked evidence blocks
- formal output instructions
- strict spoiler boundary instructions

The final model must not receive text beyond the prefix.

### 6.14 Step 10: Response Packaging
Return a structured result with fields suitable for popup rendering.

Suggested output shape:
- `status`
- `mode` (`normal`, `sparse`, `ambiguous`, `lowConfidence`, `error`)
- `resolvedName`
- `summaryParagraph`
- `bullets`
- `relatedEntities` if available
- `pageReferences` if available
- `ambiguityChoices` if needed
- `message` for low-confidence or error cases

### 6.15 Provider-Agnostic Model Layer
The backend must not be tightly coupled to a single model provider.

Use an internal abstraction such as:
- `resolveEntity(...)`
- `generateRefresher(...)`

This allows model/provider replacement later without changing the core request pipeline.

---

## 7. Popup and Edge-Case Behavior

### 7.1 Default Popup Behavior
Normal interaction flow:
- user selects text
- user invokes Book Refresher
- popup appears anchored near the selection or in a clearly associated location
- popup shows generated refresher

### 7.2 Popup Structure: Normal Mode
Normal popup contents:
- character name
- one short formal paragraph
- three to six bullet points
- optional related entities
- optional page references
- expand action

### 7.3 Popup Structure: Sparse Mode
Sparse popup contents:
- one short formal sentence
- one or two bullet points maximum
- explicit note that the character has appeared only briefly so far

### 7.4 Popup Structure: Ambiguous Mode
Ambiguous popup contents:
- short explanation that multiple likely matches were found
- list of candidate buttons/options
- minimal clarifying labels if available

The user must choose before summary generation proceeds.

### 7.5 Popup Structure: Low-Confidence Mode
Low-confidence popup contents:
- plain explanation that the system could not confidently match the selection to a character
- optional retry guidance

The system should not bluff.

### 7.6 Popup Structure: Error Mode
Error popup contents:
- short failure message
- retry action when appropriate
- close action

### 7.7 Expand Action
The popup must include an expand action for future-proofing.

In V1, expand may open:
- larger modal
or
- future side panel

The popup remains the primary surface.

### 7.8 Positioning Behavior
The default placement should be anchored near the selection.

If insufficient space exists:
- reposition to a safe visible area near the page viewport
- preserve clear visual association with the triggering selection

### 7.9 Loading Behavior
When generation is in progress:
- show compact loading state
- allow dismissal if appropriate
- prevent duplicate request spam from repeated clicks where possible

---

## 8. Data Model and Settings

### 8.1 V1 Persistence Philosophy
V1 minimizes persistence.

Persistent storage is used for settings and preferences, not for persistent character memory.

### 8.2 Reader-Side Data Objects
Suggested in-memory reader objects:

#### DocumentSession
- `documentId`
- `fileName`
- `pageCount`
- `pdfFingerprint`
- `isLoaded`

#### SelectionState
- `selectedText`
- `selectedPage`
- `selectionRange`
- `localContext`
- `isValid`

#### RefresherRequest
- `documentId`
- `selectedText`
- `selectedPage`
- `prefixText`
- `localContext`
- `requestTimestamp`

#### PopupState
- `mode`
- `isVisible`
- `anchorRect`
- `loading`
- `error`
- `content`

### 8.3 Settings Data
Persist via `chrome.storage.local`:
- backend base URL
- environment flag
- feature toggles
- optional user UI preferences

### 8.4 No Persistent Character Objects in V1
Do not persist:
- character dossiers
- evidence caches
- summary caches
- long-term book memory

This keeps the implementation aligned with the chosen stateless request model.

---

## 9. Error Handling

### 9.1 Error Classes
The system should distinguish between:
- selection errors
- boundary capture errors
- backend validation errors
- model/provider errors
- unsupported PDF/text-layer cases

### 9.2 Selection Errors
Examples:
- no text selected
- selection outside text layer
- selection spans multiple pages

Behavior:
- show immediate reader-side message
- do not call backend

### 9.3 Boundary Capture Errors
Examples:
- failed page mapping
- failed page-local range extraction
- failed selected-page prefix construction

Behavior:
- show user-facing retry guidance
- recommend smaller or cleaner selection if appropriate

### 9.4 Backend Errors
Examples:
- malformed request
- timeout
- upstream model failure
- internal processing failure

Behavior:
- show simple error popup
- allow retry
- log diagnostic details internally

### 9.5 Unsupported Document Behavior
For PDFs where text extraction or selection behavior is degraded:
- avoid silent corruption of the prefix
- fail explicitly if needed
- provide plain explanation that the selected region could not be processed reliably

### 9.6 Logging Strategy
Log internally for debugging:
- request ID
- document ID
- selected page
- request size metrics
- pipeline stage timings
- final mode (`normal`, `sparse`, `ambiguous`, etc.)
- failure class

Do not log excessive raw user text beyond what is necessary for debugging and privacy-conscious operations.

---

## 10. Implementation Risks and Validation Points

### 10.1 Boundary Capture Risk
Risk:
- text-layer DOM selection may behave unexpectedly on some PDFs

Validation:
- test with multiple real novel PDFs
- verify selected page detection
- verify selected-page prefix clipping
- verify exclusion of later text on the same page

### 10.2 Block Extraction Risk
Risk:
- local text blocks may not map cleanly to narrative units in all PDFs

Validation:
- test block extraction on typical ebook PDFs
- verify that retrieved blocks are coherent enough for summary generation
- ensure fallback remains acceptable on slightly messy files

### 10.3 Alias Resolution Risk
Risk:
- conservative alias retrieval may miss useful passages
- aggressive aliasing may create false positives

Validation:
- test characters with titles, surnames, nicknames, and repeated common names

### 10.4 Frequent Character Risk
Risk:
- main-character mentions may overwhelm retrieval if not capped properly

Validation:
- test long prefix sections with frequent character references
- verify representative-set logic keeps evidence balanced

### 10.5 Sparse Context Risk
Risk:
- early-book selections may produce weak outputs

Validation:
- verify compact output mode remains useful and does not hallucinate detail

### 10.6 PDF Variability Risk
Risk:
- PDFs differ significantly in text extraction quality

Validation:
- explicitly define supported MVP profile
- treat degraded PDFs as acceptable limitations rather than engineering failures in V1

---

## 11. Recommended Initial Implementation Order

### Phase 1 — Reader Foundation
- build reader shell
- load local PDF bytes into PDF.js
- render pages and text layer
- support text selection

### Phase 2 — Selection and Popup Foundation
- detect selection
- detect selected page
- build popup shell
- support anchored popup positioning

### Phase 3 — Safe Prefix Construction
- extract earlier page text
- derive selected-page prefix from DOM range
- assemble full safe prefix
- validate against real PDFs

### Phase 4 — Backend Pipeline
- implement request API
- implement entity check
- implement alias expansion
- implement mention search and block retrieval
- implement ranking and sparse-mode decision
- implement final refresher generation

### Phase 5 — Edge Cases and Hardening
- ambiguity flow
- low-confidence handling
- error handling
- lightweight boilerplate stripping
- representative-set tuning

---

## 12. Summary
Book Refresher V1 is implemented as a custom PDF.js-based browser reader with a stateless, on-demand AI refresher pipeline.

The architecture deliberately avoids overengineering:
- no proactive processing
- no persistent character memory
- no background token spend while reading

Instead, it focuses on a tight loop:
- capture selection
- construct safe prefix
- retrieve relevant mention blocks
- generate a formal spoiler-safe refresher
- present it in a compact popup

This architecture is simple enough for an MVP while still creating a strong foundation for future reader tools.

