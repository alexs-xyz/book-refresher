# Book Refresher MVP Milestone Plan

## Project Frame
Book Refresher is being built as a **custom PDF.js-based browser reader** with **Book Refresher** as the first integrated tool.

This milestone plan converts the agreed product and technical decisions into an execution roadmap for the MVP.

---

## Milestone 1 — Reader Foundation

### Goal
Establish the custom reader as a real PDF reading surface before any Book Refresher logic is added.

### Scope
- build the custom PDF.js-based reader shell
- support local PDF file loading
- render PDF pages and text layer
- enable scrolling
- enable zoom
- display current page information
- allow text selection
- build the reader surface first before fully wiring the extension launch flow

### Why This Milestone Exists
The product depends on owning the PDF reading surface. Before Book Refresher can work, the system must already function as a usable reader.

### Exit Criteria
- a local PDF opens successfully in the reader
- pages render correctly
- text layer is visible and selectable
- scrolling and zoom work reliably
- current page display works
- the reader is stable enough to build selection tooling on top of it

---

## Milestone 2 — Selection + Popup Foundation

### Goal
Create the interaction foundation for Book Refresher without implementing the real backend yet.

### Scope
- detect selection state inside the reader
- capture selected text
- capture selected page
- validate whether selection is usable
- capture popup anchor position
- support Book Refresher trigger through **right-click only**
- build popup shell with mocked states:
  - loading
  - success
  - ambiguous
  - low-confidence / error
- do not integrate the real backend yet

### Why This Milestone Exists
The product’s core interaction loop is:
select text → right-click → trigger Book Refresher → show popup.

This milestone proves that interaction loop in the reader before boundary logic and backend intelligence are introduced.

### Exit Criteria
- selecting text updates selection state correctly
- Book Refresher can be triggered through right-click
- popup appears in a stable, sensible position
- popup shell supports all main UI states with mock data
- the interaction is stable enough to proceed to safe-prefix construction

---

## Milestone 3 — Safe Prefix / Boundary Construction

### Goal
Construct the spoiler-safe text prefix that will later be sent to the backend.

### Scope
- support **single-page selections only**
- extract full text from all pages before the selected page
- extract the selected-page prefix using DOM Selection / Range from the rendered PDF.js text layer
- include the selected text up to the **end** of the selected range
- assemble the full safe prefix from earlier pages plus the clipped selected page
- apply only minimal normalization:
  - normalize whitespace
  - collapse obvious duplicate spaces
  - preserve text structure as much as possible
- reject unsupported selection cases cleanly
- do **not** include a developer debug inspection tool in this milestone

### Why This Milestone Exists
Spoiler safety depends on architecture. The system must prove that it can construct a safe prefix that excludes all future text.

### Exit Criteria
- valid single-page selections produce a safe prefix successfully
- selected-page cutoff excludes later text on that page
- multi-page selections are rejected cleanly
- unsupported selection cases are handled clearly
- prefix output is stable enough to be sent into backend processing

---

## Milestone 4 — Backend Refresher Pipeline

### Goal
Deliver the first real end-to-end Book Refresher behavior.

### Sequencing Note
Milestone 4 should be executed in two tracks while Milestone 3 is still being finished:
- backend-first pipeline slices can proceed against the stable shared request/response contract and fixture inputs
- live frontend/backend integration waits until Milestone 3 safe-prefix construction is stable enough that `BookRefresherRequestBuilder` produces real `prefixText` and `localContext`
- do not rename shared contract fields such as `selectedText`, `selectedPage`, `localContext`, `prefixText`, or `chosenCandidateId` during this overlap

### Scope
#### A. Backend slices that can start before Milestone 3 is fully done
- validate request payload
- harden the route shell and internal pipeline seams
- implement **rules-first entity checking**
- call the cheaper model only when necessary
- implement conservative alias expansion
- retrieve evidence blocks from explicit alias mentions only
- build local text blocks using the standard practical handling
- keep retrieval to **one block per hit** for V1
- merge overlapping or nearby blocks before ranking
- create a representative evidence set:
  - earliest defining mentions
  - recent mentions
  - a small number of middle mentions for diversity
- do **not** retrieve globally on pronouns
- determine normal vs sparse output mode
- generate the final refresher using the better model
- support structured ambiguous and low-confidence responses

#### B. Integration slices gated on Milestone 3 readiness
- connect frontend request flow to backend after boundary output is stable
- keep the shared request contract stable across the frontend/backend handoff
- support ambiguity follow-up using `chosenCandidateId`
- return popup-ready response data

### Why This Milestone Exists
This is the milestone where Book Refresher becomes an actual working feature rather than a mocked interaction.

### Exit Criteria
- backend pipeline behavior is validated against fixture-based requests before frontend cutover
- a valid selection can produce a real refresher end-to-end once Milestone 3 request building is stable
- ambiguous cases return user choices instead of bluffing
- sparse-context cases return compact output
- low-confidence/non-character cases are handled explicitly
- popup renders real backend responses across all main modes

---

## Milestone 5 — Edge Cases + Hardening

### Goal
Make the working system reliable enough to feel like an MVP instead of a prototype.

### Execution Note
- Treat this milestone as **dependency-gated hardening** on top of Milestone 3 and Milestone 4, not as parallel feature development.
- Boundary hardening and lightweight PDF noise control should start only after the safe-prefix path is real enough to harden.
- Retrieval tuning and request/response robustness should start only after the backend refresher flow is real enough to tune.
- Curated PDF fixture work can begin earlier and should be used as the evaluation harness for the rest of the milestone.
- Diagnostics, full docs, and release-readiness work remain in Milestone 6 even if backlog organization groups some of that work nearby.

### Scope
#### A. Selection and Boundary Hardening
- handle empty selection
- handle multi-page selection
- handle selection outside text layer
- handle failed page mapping
- handle failed clipped extraction
- ensure popup-safe error states for these failures

#### B. Lightweight PDF Noise Control
- add lightweight recurring-noise filtering for extracted text
- strip only obvious repeated boilerplate when cheap to detect
- avoid heavy preprocessing or expensive cleanup

#### C. Retrieval Quality Tuning
- tune representative-set caps
- tune alias false positives
- tune overlapping block merge behavior
- tune sparse-mode thresholds

#### D. Request / Response Robustness
- structured error classes
- timeout handling
- duplicate request suppression
- retry behavior
- request size limits

#### E. Curated PDF Test Set
Use a small representative PDF set for hardening:
- one normal ebook-style PDF
- one slightly messier OCR/text PDF
- one denser / less ideal PDF

### Why This Milestone Exists
A working feature is not enough. The MVP must behave predictably, fail clearly, and stay useful across expected document quality differences.

### Exit Criteria
- unsupported selections fail cleanly and understandably
- obvious repeated PDF noise is reduced when cheap to detect
- retrieval feels more stable across common character scenarios
- repeated clicks and slow requests do not create messy UI behavior
- behavior is validated against the small curated PDF test set
- the system feels reliable enough for MVP use

---

## Milestone 6 — Polish / MVP Release Prep

### Goal
Turn the hardened working product into a coherent MVP that is understandable, runnable, and ready to present or hand off.

### Execution Note
- Start Milestone 6 planning now, but keep implementation gated on Milestone 5 hardening actually being completed and verified.
- Current sequencing reality for this plan:
  - Milestone 3 is almost finished
  - Milestone 4 is actively being implemented
  - Milestone 5 has planning but has not started implementation yet
- Some backlog and documentation organization still groups release-prep work near Milestone 5, but for execution these items belong to Milestone 6 and should stay deferred until Milestone 5 exit criteria are met.
- UI polish, diagnostics shape, config structure, and documentation outlines can be prepared earlier, but they should land against the hardened Milestone 5 behavior rather than today's in-flight Milestone 3 and Milestone 4 seams.

### Scope
#### A. Practical UI / UX Polish
- improve visual consistency of reader and popup flows
- refine popup sizing and spacing
- refine loading, empty, and error states
- improve visual association between selection and popup
- provide minimal settings access point if needed

#### B. Configuration and Environment Setup
- define environment/config structure
- support backend URL configuration
- support provider/model configuration abstraction
- provide clear local run instructions
- provide example configuration where needed

#### C. Practical Diagnostics and Logging
- request IDs
- frontend error classification
- backend stage timing logs
- mode-level outcome tracking (`normal`, `sparse`, `ambiguous`, `lowConfidence`, `error`)
- clear surfaced error messaging

#### D. Full Documentation Set
Provide full project documentation, including:
- setup and run instructions
- architecture overview
- component/module overview
- backend API documentation
- supported PDF limitations
- known limitations and non-goals
- usage flow documentation
- contributor/developer documentation
- configuration/environment documentation
- debugging/troubleshooting notes
- release/readiness notes

#### E. MVP Readiness Checklist
Define and validate a clear readiness checklist, including:
- installs and launches reliably
- opens local text-based PDFs
- selection works
- safe prefix works
- backend returns all main modes
- popup states behave correctly
- curated PDF test set passes at acceptable quality
- setup instructions work
- known limitations are documented

#### F. Lightweight In-Product Help
- add a minimal help surface or first-use hint
- explain the core action briefly:
  - select text
  - right-click
  - choose Book Refresher

### Why This Milestone Exists
This milestone turns the product from an internal working build into a presentable, understandable, and reviewable MVP.

### Exit Criteria
- the reader and popup experience feel coherent and stable
- project setup is clear enough for another developer to run
- diagnostics exist for failures and main response modes
- full documentation is complete
- lightweight onboarding/help exists in-product
- the product passes the MVP readiness checklist

---

## Milestone Dependencies

### Dependency Order
1. Reader Foundation
2. Selection + Popup Foundation
3. Safe Prefix / Boundary Construction
4. Backend Refresher Pipeline
5. Edge Cases + Hardening
6. Polish / MVP Release Prep

### Why This Order
This sequence follows the actual risk and product dependency stack:
- first build the reading surface
- then make interaction work
- then enforce spoiler-safe input construction
- then implement real AI behavior
- then harden and tune
- then package the result as an MVP

Milestone 4 may begin on backend-only slices once the shared contract is stable, but it is not complete until Milestone 3 boundary output is ready for live request assembly.
Milestone 6 planning may begin before Milestone 5 implementation starts, but Milestone 6 execution should not absorb unfinished Milestone 5 hardening work.

---

## MVP Definition
The MVP is complete when the following is true:
- the user can open a local text-based PDF in the custom reader
- the user can highlight a character name and right-click to trigger Book Refresher
- the system constructs a safe prefix up to the selected boundary
- the backend can generate a formal, spoiler-safe refresher from earlier mentions only
- ambiguity and sparse-context cases are handled explicitly
- expected edge cases fail cleanly
- the product is documented, testable, and stable enough to present as an MVP

---

## Explicitly Excluded from the MVP
The following are still out of scope at MVP stage:
- proactive background summarization while reading
- persistent character memory or per-character caching
- support for places, objects, factions, or arbitrary concepts
- cross-device sync
- series-aware memory across multiple books
- full PDF editing suite
- advanced annotation system
- OS-level default PDF opener integration
- broad support for scanned or severely degraded PDFs

---

## Summary
This MVP plan intentionally favors:
- a strong reader foundation
- strict spoiler safety
- simple on-demand request flow
- explicit edge-case handling
- practical extensibility for future reader tools

Book Refresher V1 is therefore not just a one-off summary feature. It is the first tool inside a browser-based PDF reading platform that the project can expand later.
