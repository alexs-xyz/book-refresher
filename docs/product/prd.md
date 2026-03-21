# Product Requirements Document (PRD)

## Product Name
Book Refresher

## Product Type
Custom PDF.js-based browser reader with **Book Refresher** as the first tool.

---

## 1. Overview
Book Refresher is a browser-based PDF reading experience designed for reading fiction and other narrative texts without losing track of characters. The product allows a reader to highlight a character name inside a PDF, right-click, and request a spoiler-safe refresher about that character based only on the text the reader has reached so far.

The core promise is simple:

**Help readers remember who a character is and what they have done so far, without revealing anything beyond the exact point in the text where the reader triggered the request.**

Book Refresher is not being built as a plugin on top of Chrome’s native PDF viewer. Instead, it is being built as a **custom PDF.js-based browser reader**, giving full control over text selection, page context, popups, and future reader tools.

---

## 2. Problem Statement
Readers often forget who a character is, what they have done previously, or how they relate to others in the story—especially in long books, complex novels, multi-POV stories, or books read over a longer period of time.

Existing solutions are weak:
- searching online risks spoilers
- flipping backwards through the book is slow and frustrating
- taking manual notes interrupts reading flow
- generic AI summaries often spoil future events because they lack a strict reading boundary

The user needs a way to quickly refresh their memory **inside the reading experience itself**, with a hard spoiler boundary.

---

## 3. Product Vision
Create a browser-based reading platform where the user can interact directly with the PDF text and invoke intelligent reading tools in context.

Book Refresher is the first such tool. Over time, the platform may expand into a broader PDF reading and study workspace with additional tools such as notes, highlights, study aids, entity maps, and reading utilities.

---

## 4. Goals
### Primary Goal
Let a user request a spoiler-safe refresher for a selected character directly inside the reader.

### Secondary Goals
- keep the interaction fast and lightweight
- preserve reading flow
- avoid spoilers by architecture, not just prompt wording
- keep the system simple enough for an MVP
- establish a strong foundation for future reader tools

---

## 5. Non-Goals (V1)
The following are explicitly out of scope for V1:
- full PDF editing suite
- proactive background summarization while reading
- persistent character memory or long-term per-character caching
- support for places, objects, factions, or arbitrary concepts
- support for cross-device sync
- support for all PDF types, especially scanned/image-only PDFs
- chapter-aware or book-series-aware memory across multiple books
- OS-level default PDF opener behavior
- deep annotation or collaboration features

---

## 6. Target User
### Primary User
A reader who is reading a book as a PDF in the browser and occasionally forgets who a character is or what they have done so far.

### Ideal User Traits
- reads long fiction or dense narrative texts
- reads in sessions across multiple days or weeks
- wants quick in-context clarification without leaving the reading flow
- cares strongly about avoiding spoilers

---

## 7. Core User Story
As a reader, when I encounter a character name I vaguely remember, I want to highlight it and ask for a refresher so that I can recall who the character is and what they have done so far, without seeing spoilers from later in the book.

---

## 8. User Experience Flow
### Primary Flow
1. User opens a PDF in the custom Book Refresher reader.
2. User reads normally.
3. User highlights a character name or word.
4. User right-clicks.
5. User selects **Book Refresher** from the context menu.
6. The system generates a spoiler-safe refresher using only text up to the exact selected boundary.
7. A compact popup appears near the selection.
8. User reads the refresher and continues reading.
9. If needed, user expands to a larger view.

### Secondary Flow: Ambiguous Selection
1. User highlights a name that could refer to multiple characters.
2. The system detects ambiguity.
3. The popup asks the user to choose among likely candidates.
4. After selection, the refresher is generated.

### Secondary Flow: Sparse Context
1. User highlights a character very early in the text.
2. The system finds only limited earlier evidence.
3. The popup shows a shorter fallback refresher rather than forcing a full one.

---

## 9. Core Product Principles
### 9.1 Spoiler Safety by Architecture
The system must not rely only on prompt instructions to avoid spoilers.

The model may only receive text from the beginning of the document up to the exact point where the refresher was triggered.

### 9.2 Reader Flow First
The feature must interrupt the reading experience as little as possible.

### 9.3 Honest Outputs
If the system is uncertain, it should say so. It should not guess aggressively.

### 9.4 Simplicity Over Cleverness
V1 should prefer a simpler, predictable system over an overengineered memory architecture.

---

## 10. Functional Requirements

### 10.1 Custom PDF Reader
The product must provide a custom browser-based PDF reading interface built on PDF.js.

#### Requirements
- open and display PDF documents in-browser
- render selectable text
- support normal reading behaviors such as scrolling and page navigation
- support right-click interaction on selected text

### 10.2 Text Selection Integration
The user must be able to highlight text inside the reader.

#### Requirements
- detect the current selection
- detect the selected page
- determine the selected text boundary precisely enough to construct a safe prefix

### 10.3 Book Refresher Invocation
The user must be able to invoke Book Refresher from a selected text region.

#### Requirements
- context menu entry labeled **Book Refresher**
- request begins only when explicitly triggered by the user
- no background summarization while the user is reading

### 10.4 Spoiler Boundary Enforcement
The system must only use text up to the exact selected boundary.

#### Requirements
- include all earlier pages in full
- include only the text on the selected page up to and including the selected text boundary
- exclude all later text, including later text on the same page

### 10.5 Character Detection
The system must determine whether the selected text likely refers to a character.

#### Requirements
- use a cheap entity-resolution step before final summary generation
- support low-confidence handling
- support ambiguous-name handling
- reject clearly unsupported selections when confidence is too low

### 10.6 Refresher Generation
The system must generate a spoiler-safe refresher for the selected character.

#### Requirements
- produce a formal, paraphrased summary
- base the refresher on mention-based evidence retrieval from the safe prefix
- avoid future-story information
- adapt output length based on available evidence

### 10.7 Popup Presentation
The refresher must appear as a compact popup.

#### Requirements
- appear near the selection or in a clearly associated anchored position
- include a short paragraph and bullets in the normal case
- include an expand action for larger viewing

### 10.8 Sparse Context Fallback
If too little earlier evidence exists, the output must fall back gracefully.

#### Requirements
- show a shorter response format
- explicitly state that the character has appeared only briefly so far
- avoid invented detail or filler

### 10.9 Ambiguity Handling
If the selected name is ambiguous, the user must be able to clarify.

#### Requirements
- show multiple likely matches when necessary
- allow the user to select the intended character candidate
- only proceed after ambiguity is resolved when needed

### 10.10 Error Handling
The product must handle failure states clearly.

#### Requirements
- loading state during generation
- failure state if the refresher cannot be generated
- low-confidence state if the system cannot confidently match the selection to a character

---

## 11. Out-of-Scope Behavior That Must Not Happen
- the system must not summarize text beyond the selected boundary
- the system must not silently guess a character if ambiguity is high
- the system must not generate content while the user is merely scrolling
- the system must not require proactive per-character summary creation
- the system must not depend on persistent character caching for correctness

---

## 12. Retrieval and Summary Strategy (Product-Level)
V1 will not maintain a complex persistent character memory system.

Instead, each refresher request is treated as a mostly self-contained operation:
1. determine safe text prefix
2. determine whether the selection likely refers to a character
3. expand possible aliases for that character
4. search the safe prefix for earlier mentions
5. retrieve local evidence blocks around those mentions
6. rank and deduplicate evidence blocks
7. generate the refresher from that evidence only

This keeps the system simpler, more predictable, and more aligned with the expected user behavior.

---

## 13. Supported Content Profile for MVP
### Supported
- text-selectable PDFs
- mostly linear narrative layouts
- born-digital books and readable ebook-style PDFs

### Not Reliably Supported
- scanned image-only PDFs
- severely broken OCR text layers
- highly complex multi-column academic or magazine layouts
- PDFs with highly unreliable reading order

The MVP should clearly target text-based books rather than all possible PDF documents.

---

## 14. UX Requirements

### 14.1 Default Popup Structure
Normal refresher popup should contain:
- character name
- one short formal paragraph
- three to six bullet points
- optional related-character and page-reference metadata when available
- expand action

### 14.2 Sparse Context Popup Structure
Sparse-context popup should contain:
- one short sentence
- one or two bullets maximum
- explicit indication that the character has appeared only briefly so far

### 14.3 Ambiguity UI
Ambiguous cases should contain:
- a short explanation that multiple likely matches were found
- two to four candidate options
- minimal clarifying labels if possible

### 14.4 Tone
The tone should be formal, neutral, and reference-like.

---

## 15. Quality Requirements
### Accuracy
The refresher should be directionally accurate and grounded in retrieved evidence.

### Spoiler Safety
No future text may be used.

### Responsiveness
The feature should feel reasonably quick in normal reading conditions.

### Trustworthiness
The UI should acknowledge uncertainty rather than fabricate confidence.

---

## 16. Success Metrics
### Primary Product Metrics
- percentage of refresher requests that complete successfully
- percentage of users who continue reading after using the refresher
- average time from trigger to popup display
- user-rated usefulness of refresher
- user-rated spoiler safety confidence

### Quality Metrics
- false positive rate for non-character selections
- ambiguity-resolution success rate
- sparse-context fallback rate
- manual complaint rate about spoilers or wrong character resolution

---

## 17. Assumptions
- the reader is reading a text-selectable PDF
- the selected text can be captured from the PDF.js text layer
- enough local text can be reconstructed to form a safe prefix
- readers care more about spoiler safety and usability than exhaustive perfect recall
- most characters will only be refreshed occasionally, not repeatedly many times

---

## 18. Constraints
- PDF structure quality varies significantly by file
- exact text boundary capture is a technical risk area
- mention-based evidence retrieval may miss some pronoun-heavy or indirectly described passages
- V1 should remain provider-agnostic and not depend on one LLM vendor

---

## 19. Risks
### 19.1 Boundary Reconstruction Risk
Capturing the exact selected boundary in a way that matches user expectation may be difficult on some PDFs.

### 19.2 PDF Structure Risk
Poorly structured PDFs may reduce the quality of evidence retrieval.

### 19.3 Character Resolution Risk
Names with multiple aliases or overlapping naming patterns may cause ambiguity.

### 19.4 Context Sparsity Risk
Very early-book or minor-character selections may not provide enough evidence for a rich refresher.

---

## 20. MVP Definition
The MVP is successful if a user can:
- open a text-based book PDF in the custom reader
- highlight a character name
- right-click and trigger Book Refresher
- receive a spoiler-safe formal popup based only on text up to the selected boundary
- get reasonable ambiguity handling and sparse-context fallback behavior

The MVP does **not** require:
- offline mode
- cross-session per-character memory
- full editor functionality
- universal PDF compatibility
- multi-book or series-aware refreshers

---

## 21. Future Extensions (Beyond V1)
Potential future directions include:
- character relationship map
- entity glossary
- highlights and notes
- bookmarks and study tools
- support for places, objects, and factions
- per-book saved context or optional memory layers
- broader PDF workspace features
- advanced annotation and editing tools

---

## 22. Open Questions for Technical Spec
The following remain for the technical architecture spec rather than the PRD:
- exact structure of the PDF.js viewer shell
- exact method for boundary capture in the text layer
- detailed backend mention-retrieval pipeline design
- popup placement and behavior details under edge conditions

---

## 23. Summary
Book Refresher V1 is a focused tool inside a custom PDF.js-based browser reader.

Its purpose is to let readers recover their memory of a character quickly and safely, without spoilers, directly inside the reading experience.

The MVP succeeds by being:
- simple
- precise in its spoiler boundary
- lightweight in interaction
- honest in uncertainty
- extensible as the first tool in a larger reader platform

