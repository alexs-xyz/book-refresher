# Book Refresher Backend API + Architecture Specification

## Project
Book Refresher

## Product Frame
Custom PDF.js-based browser reader with **Book Refresher** as the first integrated tool.

This document defines the backend API contract and backend architecture for Book Refresher V1.

---

## 1. Purpose

The backend exists to support the Book Refresher tool in a stateless, on-demand way.

Its job is to:
- receive a spoiler-safe text prefix from the reader
- determine whether the selected text likely refers to a character
- handle ambiguity conservatively
- retrieve evidence from earlier mentions only
- generate a formal spoiler-safe refresher
- return popup-ready structured output to the reader

The backend does **not**:
- parse the original PDF file directly in V1
- maintain persistent per-character memory in V1
- proactively summarize while the user is reading
- depend on any one single LLM provider

---

## 2. Architectural Principles

### 2.1 Stateless Request Model
Each refresher request must be processable independently.

The backend must not rely on saved character state, saved evidence sets, or long-term book memory for correctness.

### 2.2 Spoiler Safety by Input Boundary
The backend only works on the safe prefix provided by the client.

It must not reconstruct or infer later text beyond what was included in the request.

### 2.3 Product Outcomes vs Errors
The following are valid product outcomes and are **not** errors:
- `normal`
- `sparse`
- `ambiguous`
- `lowConfidence`

Only actual failures should return `status=error`.

### 2.4 Provider-Agnostic Design
The backend must support swapping model providers without changing the core refresher pipeline.

### 2.5 Simplicity Over Overengineering
The MVP backend favors:
- one public refresher endpoint
- one health endpoint
- one service process
- a layered internal pipeline
- no application database

---

## 3. Public API Surface

### 3.1 Main Endpoint
`POST /api/refresher`

This is the single public business endpoint in V1.

It handles:
- initial refresher requests
- ambiguity follow-up requests using `chosenCandidateId`

### 3.2 Health Endpoint
`GET /api/health`

This endpoint exists for:
- setup validation
- runtime health checks
- simple operational diagnostics

### 3.3 API Surface Philosophy
Externally, the backend stays simple.

Internally, the backend is structured as a multi-stage pipeline.

This keeps frontend integration straightforward while still allowing the backend codebase to remain clean and modular.

---

## 4. Request Contract

### 4.1 Request Philosophy
The client must send the already-constructed safe prefix.

The backend is not responsible for reconstructing the PDF boundary in V1.

### 4.2 Required Request Fields
The following fields are required:
- `requestId`
- `documentId`
- `selectedText`
- `selectedPage`
- `localContext`
- `prefixText`

### 4.3 Optional Request Fields
The following fields are optional:
- `chosenCandidateId`
- `documentMeta`

### 4.4 Request Schema
```json
{
  "requestId": "uuid-or-client-generated-id",
  "documentId": "stable-runtime-document-id",
  "selectedText": "Darcy",
  "selectedPage": 91,
  "localContext": "Elizabeth looked at Darcy and turned away...",
  "prefixText": "full safe prefix text up to the selected boundary",
  "chosenCandidateId": null,
  "documentMeta": {
    "fileName": "pride-and-prejudice.pdf",
    "pageCount": 432
  }
}
```

### 4.5 Field Notes
#### `requestId`
Used for:
- request tracing
- logging correlation
- response matching

#### `documentId`
A client-generated runtime identifier for the current document session.

#### `selectedText`
The exact selected text the user triggered Book Refresher on.

#### `selectedPage`
The page number where the selection occurred.

#### `localContext`
A small text window around the selected text.

This is required because it improves:
- entity resolution
- ambiguity handling
- low-confidence decisions

#### `prefixText`
The full spoiler-safe text prefix constructed by the frontend.

This is the most important input field.

#### `chosenCandidateId`
Used only in the ambiguity follow-up flow.

If present, the backend should validate and use the chosen candidate rather than performing normal ambiguity resolution again.

#### `documentMeta`
Optional metadata for logging, debugging, and future extensibility.

It should not be required for business correctness.

---

## 5. Response Contract

### 5.1 Response Philosophy
All responses use a unified top-level envelope.

This keeps frontend handling consistent and makes logging/diagnostics cleaner.

### 5.2 Top-Level Envelope
```json
{
  "requestId": "same-id-as-request",
  "status": "ok",
  "mode": "normal",
  "data": {},
  "error": null
}
```

### 5.3 Successful Status
Use `status="ok"` for the following valid modes:
- `normal`
- `sparse`
- `ambiguous`
- `lowConfidence`

### 5.4 Error Status
Use `status="error"` only for real failures.

In that case:
- `mode` is `null`
- `data` is `null`
- `error` is populated

### 5.5 Normal Mode Response
```json
{
  "requestId": "123",
  "status": "ok",
  "mode": "normal",
  "data": {
    "resolvedName": "Fitzwilliam Darcy",
    "summaryParagraph": "Formal short paragraph here.",
    "bullets": [
      "Bullet 1",
      "Bullet 2",
      "Bullet 3"
    ],
    "relatedEntities": ["Elizabeth Bennet", "Jane Bennet"],
    "pageReferences": [12, 18, 44]
  },
  "error": null
}
```

### 5.6 Sparse Mode Response
```json
{
  "requestId": "123",
  "status": "ok",
  "mode": "sparse",
  "data": {
    "resolvedName": "Charlotte Lucas",
    "summaryParagraph": "Charlotte Lucas has appeared only briefly so far.",
    "bullets": [
      "She has appeared in earlier social scenes.",
      "Her role has not yet been developed in much detail."
    ],
    "relatedEntities": [],
    "pageReferences": [23]
  },
  "error": null
}
```

### 5.7 Ambiguous Mode Response
```json
{
  "requestId": "123",
  "status": "ok",
  "mode": "ambiguous",
  "data": {
    "selectedText": "Tom",
    "choices": [
      {
        "id": "cand_1",
        "label": "Tom Sawyer",
        "description": "Frequently appears with Huck"
      },
      {
        "id": "cand_2",
        "label": "Tom the servant",
        "description": "Minor household character"
      }
    ]
  },
  "error": null
}
```

### 5.8 Low-Confidence Mode Response
```json
{
  "requestId": "123",
  "status": "ok",
  "mode": "lowConfidence",
  "data": {
    "message": "I couldn’t confidently match this selection to a character."
  },
  "error": null
}
```

### 5.9 Error Response
```json
{
  "requestId": "123",
  "status": "error",
  "mode": null,
  "data": null,
  "error": {
    "code": "BOUNDARY_INVALID",
    "message": "The selected region could not be processed.",
    "retryable": false
  }
}
```

### 5.10 Candidate IDs in Ambiguous Responses
Ambiguous responses must include internal candidate IDs so the client can submit an exact follow-up choice.

The client should not be expected to echo labels back as identifiers.

---

## 6. HTTP Status Mapping

### 6.1 Philosophy
The backend uses proper HTTP semantics in addition to the JSON response envelope.

### 6.2 Successful Product Outcomes
Use `200 OK` for:
- `normal`
- `sparse`
- `ambiguous`
- `lowConfidence`

### 6.3 Client / Input Failures
Use:
- `400 Bad Request` for malformed requests
- `422 Unprocessable Entity` for unsupported or inconsistent processing input

### 6.4 Rate Limit Failures
Use:
- `429 Too Many Requests` where applicable

### 6.5 Backend / Provider / System Failures
Use:
- `500 Internal Server Error` for internal backend failures
- `502`, `503`, or `504` for provider/unavailability/timeout cases depending on implementation preference

---

## 7. Internal Backend Architecture

### 7.1 Chosen Internal Shape
The backend uses a **layered service pipeline** behind the single public endpoint.

This is intentionally not:
- one giant monolithic handler
- a job queue/worker system
- a microservice architecture

### 7.2 High-Level Internal Components
Suggested core components:
- `RefresherController`
- `HealthController`
- `RefresherRequestValidator`
- `CandidateResolver`
- `AliasExpander`
- `MentionRetriever`
- `EvidenceBlockExtractor`
- `EvidenceDeduplicator`
- `EvidenceSelector`
- `OutputModeDecider`
- `RefresherGenerator`
- `ResponseMapper`
- `AiProvider` adapter(s)
- `ProviderFactory`
- `ProviderConfig`

### 7.3 Execution Model
Processing is synchronous HTTP request/response.

This is the correct fit for the product’s popup interaction flow.

---

## 8. Internal Pipeline Stages

### 8.1 Stage 1 — Request Validation
#### Responsibility
Validate the incoming request before any substantive processing starts.

#### Checks
- required fields present
- required strings non-empty
- `selectedPage` is valid
- `prefixText` size within allowed bounds
- `chosenCandidateId` well-formed if present

#### Failure Behavior
If validation fails:
- return a request-family error
- do not continue pipeline execution

---

### 8.2 Stage 2 — Candidate Resolution
#### Responsibility
Determine whether the selected text likely refers to:
- one character
- multiple possible characters
- no usable character match

#### Chosen Approach
Use **rules-first, model-second** resolution.

#### Rules-First Signals
Examples:
- capitalization patterns
- title-based patterns (`Mr.`, `Mrs.`, `Dr.`, etc.)
- repetition in prefix text
- local context cues

#### Model-Second Use
Use the cheaper model only when heuristics are insufficient.

#### Ambiguity Follow-Up Path
If `chosenCandidateId` is present:
- validate the selected candidate
- skip normal ambiguity resolution

This avoids unnecessary re-resolution on the second request.

---

### 8.3 Stage 3 — Alias Expansion
#### Responsibility
Build a conservative alias set for the resolved character.

#### Examples
- surname only
- title + surname
- full name
- short name

#### Constraints
- do not retrieve globally on pronouns
- do not add overly aggressive aliases

---

### 8.4 Stage 4 — Mention Retrieval
#### Responsibility
Search the safe prefix for explicit alias mentions.

#### Chosen Retrieval Strategy
Use normalized explicit alias search.

This should be:
- boundary-aware
- lightweight
- deterministic
- easy to debug

No semantic retrieval or embedding-based retrieval is used in V1.

---

### 8.5 Stage 5 — Evidence Block Extraction
#### Responsibility
Turn mention hits into local evidence blocks.

#### Chosen Strategy
Use a **paragraph-first, fallback-window hybrid**:
- prefer paragraph-like blocks when the text structure is usable
- fall back to fixed-size local windows when structure is unreliable

#### Constraints
- one block per hit in V1
- no scene stitching
- no multi-block continuation inference

---

### 8.6 Stage 6 — Block Merge + Deduplication
#### Responsibility
Merge overlapping or near-duplicate evidence blocks before ranking.

#### Chosen Strategy
Use:
- positional overlap logic
- lightweight text similarity

This keeps the evidence set compact without introducing model-based deduplication.

---

### 8.7 Stage 7 — Evidence Selection
#### Responsibility
Construct the representative set that goes into final generation.

#### Chosen Strategy
Use a simple bucket strategy:
- earliest defining mentions
- recent mentions
- a few middle mentions for diversity

Do not include all matching blocks.

This is especially important for frequent characters.

---

### 8.8 Stage 8 — Output Mode Decision
#### Responsibility
Decide whether the response should use:
- `normal`
- `sparse`

#### Chosen Strategy
Use:
- block-count threshold
- evidence-volume threshold

Do not use an LLM to decide output mode.

---

### 8.9 Stage 9 — Final Refresher Generation
#### Responsibility
Generate the formal visible output from:
- resolved character
- local context
- selected evidence set
- output mode

#### Chosen Strategy
Use the better model for final generation.

The model receives only:
- resolved identity
- alias set
- selected text
- local context
- selected evidence blocks
- formal output instructions
- strict spoiler-safe instruction

#### Output Expectations
The generator must support structured fields such as:
- `summaryParagraph`
- `bullets`
- optional `relatedEntities`
- optional `pageReferences`

---

### 8.10 Stage 10 — Response Mapping
#### Responsibility
Map internal pipeline results into the public API envelope.

This stage must keep:
- internal processing semantics
- public API response semantics

cleanly separated.

---

## 9. Provider Abstraction

### 9.1 Chosen Abstraction Shape
Use a **thin provider adapter layer**.

Do not let provider SDK details leak across the pipeline.

### 9.2 Abstraction Philosophy
The abstraction is **task-shaped**, not low-level provider-feature-shaped.

The backend cares about:
- candidate-resolution assistance
- refresher generation

It does not need generic exposure of every provider feature.

### 9.3 Suggested Interface
Example conceptual methods:
- `assistCandidateResolution(input)`
- `generateRefresher(input)`

### 9.4 Active Provider Model
In V1:
- one active provider implementation is sufficient
- the configuration should still separate model roles for each task

### 9.5 Role-Specific Model Configuration
The config should support separate model names for:
- candidate-resolution assistance
- final refresher generation

### 9.6 Provider-Specific Logic Placement
Provider-specific differences must be contained inside the adapter layer.

Examples:
- structured output support
- prompt-formatting quirks
- token/context behavior
- timeout behavior
- parse normalization

### 9.7 Structured Output Strategy
The application expects structured internal results.

Adapters should:
- use provider-native structured output features when available
- fall back to robust prompt shaping when necessary
- normalize results into one internal shape

### 9.8 Provider Error Normalization
Provider failures must be normalized into internal provider error classes rather than exposing raw provider SDK details.

### 9.9 Suggested Components
- `AiProvider`
- `ProviderFactory`
- `ProviderConfig`
- `OpenAIProvider` (first implementation)
- future adapters such as `GeminiProvider`, `AnthropicProvider`, or `LocalProvider`

---

## 10. Error Model

### 10.1 Error Philosophy
Valid product outcomes are not errors.

Only actual failures produce `status="error"`.

### 10.2 Internal Error Families
Use a compact internal hierarchy:
- `RequestError`
- `BoundaryError`
- `ProcessingError`
- `ProviderError`
- `SystemError`

Each should derive from a common `AppError` base.

### 10.3 Public Error Object
The public error object should contain:
- `code`
- `message`
- `retryable`

### 10.4 Request Error Examples
Examples:
- `REQUEST_INVALID`
- `REQUEST_MISSING_FIELD`
- `REQUEST_EMPTY_SELECTION`
- `REQUEST_PREFIX_TOO_LARGE`
- `REQUEST_CANDIDATE_INVALID`

### 10.5 Boundary Error Examples
Examples:
- `BOUNDARY_INVALID`
- `BOUNDARY_INCONSISTENT`
- `SELECTION_UNSUPPORTED`

### 10.6 Processing Error Examples
Examples:
- `PROCESSING_FAILED`
- `RESOLUTION_FAILED`
- `RETRIEVAL_FAILED`
- `GENERATION_PAYLOAD_INVALID`
- `RESPONSE_MAPPING_FAILED`

### 10.7 Provider Error Examples
Examples:
- `PROVIDER_TIMEOUT`
- `PROVIDER_AUTH_ERROR`
- `PROVIDER_RATE_LIMIT`
- `PROVIDER_RESPONSE_INVALID`
- `PROVIDER_CONTEXT_LIMIT`
- `PROVIDER_UNAVAILABLE`

### 10.8 System Error Examples
Examples:
- `SYSTEM_INTERNAL_ERROR`
- `SYSTEM_CONFIG_ERROR`
- `SYSTEM_DEPENDENCY_ERROR`

### 10.9 Retryability Model
Retryability is determined by error family/class.

Examples:
- invalid request -> not retryable
- invalid boundary -> not retryable
- provider timeout -> retryable
- provider unavailable -> retryable

### 10.10 Logging vs Public Messaging
Public messages should be:
- short
- stable
- user-safe

Internal logs should contain richer diagnostics such as:
- stage
- wrapped exception
- provider details
- request metrics

### 10.11 Ambiguous / Low-Confidence Handling
`ambiguous` and `lowConfidence` remain successful product outcomes.

They do not use the error model.

---

## 11. Health Endpoint

### 11.1 Purpose
`GET /api/health` exists to confirm that the service is alive and correctly configured enough to respond.

### 11.2 Suggested Behavior
Return a lightweight success response indicating:
- service is running
- version/environment if desired
- provider config load success if safe to report

The endpoint should not expose sensitive configuration details.

---

## 12. Deployment Shape

### 12.1 Deployment Topology
Use a **single backend service** in V1.

The service handles:
- `GET /api/health`
- `POST /api/refresher`
- provider calls
- config loading
- logging

### 12.2 Runtime Packaging
Use:
- normal application process for local development
- containerized deployment path for portability/handoff

### 12.3 No Queue/Worker Model in V1
Do not introduce:
- background workers
- async job polling
- multi-service orchestration

The popup workflow is best served by synchronous processing.

---

## 13. Configuration Model

### 13.1 Chosen Configuration Approach
Use a **typed central config layer**.

Do not read ad hoc environment variables throughout the codebase.

### 13.2 Suggested Config Categories
#### Server
- host
- port
- environment name

#### API
- allowed origins
- request size limit
- request timeout

#### AI Provider
- active provider name
- resolution model
- refresher model
- provider timeout
- provider secret/key

#### Logging
- log level
- request tracing enabled/disabled

#### Feature Flags
Optional toggles such as:
- structured output mode enabled/disabled
- logging verbosity

### 13.3 Startup Validation
Configuration should be validated at startup so the service fails fast on missing or invalid required config.

---

## 14. Secret Handling

### 14.1 Rule
Provider secrets must exist **only on the backend**.

They must never be shipped to the client/reader/extension.

### 14.2 Development Handling
Local development may use:
- `.env`
- local environment variable injection

### 14.3 Deployed Handling
Deployed environments should use:
- platform environment secrets
- secret store / secret manager if available

---

## 15. Environment Separation

### 15.1 Chosen Environment Model
Support:
- local
- one deployed non-production environment
- production later as needed

This provides enough structure without overcomplicating MVP operations.

---

## 16. Backend Access / Auth

### 16.1 MVP Decision
For MVP, no end-user auth system is required **only if** the backend is used in a controlled/internal context.

### 16.2 Important Constraint
This is acceptable for:
- local use
- internal testing
- controlled demos

It is **not** acceptable for broad public distribution.

### 16.3 Future Requirement
Before public release, the backend will need:
- usage control
- real auth or protected gateway access
- abuse/cost protection

This is explicitly deferred beyond the MVP.

---

## 17. CORS / Origin Policy

### 17.1 Chosen Policy
Use a strict allowlist.

Allowed origins should include only:
- local development origin(s)
- approved extension origin(s)
- approved deployed reader origin(s) if applicable later

### 17.2 Disallowed Default
Do not use wildcard `*` CORS in the backend by default.

---

## 18. Data Persistence

### 18.1 Chosen MVP Model
No application database is required in V1.

### 18.2 Rationale
This is consistent with:
- stateless request processing
- no persistent character memory
- no per-book backend memory

### 18.3 Logging
Operational logs may exist, but they do not imply a core application database.

### 18.4 Future Extension Room
Analytics or additional persistence can be added later if future features justify it.

---

## 19. Operational Limits

### 19.1 Limits Should Be Config-Driven
The following should be configurable:
- maximum prefix size
- request timeout
- provider timeout
- maximum evidence blocks
- output token/response cap if applicable

### 19.2 Purpose
These limits help control:
- request cost
- response latency
- provider failures
- operational predictability

---

## 20. Logging and Diagnostics

### 20.1 Logging Goals
Logging should support:
- debugging failures
- understanding request behavior
- observing mode distribution
- correlating provider failures

### 20.2 Recommended Logged Fields
At minimum:
- `requestId`
- `documentId`
- selected page
- request size metrics
- pipeline stage timings
- final mode (`normal`, `sparse`, `ambiguous`, `lowConfidence`, `error`)
- error code when relevant

### 20.3 Privacy Constraint
Do not log excessive raw user text beyond what is operationally necessary.

The backend should remain conservative about text retention.

---

## 21. Testing Strategy

### 21.1 API-Level Testing
Test:
- request validation behavior
- successful response envelope shapes
- error envelope shapes
- mode-specific response handling

### 21.2 Provider Adapter Testing
Use adapter contract tests to verify that each provider implementation returns normalized internal result shapes.

### 21.3 Pipeline Testing
Test the main internal stages independently where practical:
- candidate resolution
- alias expansion
- mention retrieval
- block extraction
- evidence selection
- sparse-mode decision

### 21.4 End-to-End Testing
Validate end-to-end backend behavior with representative prefix inputs derived from real PDF reading flows.

---

## 22. Known Deliberate Omissions in V1
The backend deliberately does **not** include:
- PDF parsing on the backend
- document storage
- per-character memory
- per-book memory
- caching as a correctness requirement
- async job queues
- public auth system
- application database
- semantic retrieval/embedding retrieval
- pronoun-based retrieval

These omissions are intentional and aligned with the MVP scope.

---

## 23. Summary
Book Refresher V1 uses a backend designed for one focused job:

- accept a safe text prefix
- determine whether the selection is a character
- retrieve earlier explicit-mention evidence
- generate a formal spoiler-safe refresher
- return structured popup-ready output

The backend remains intentionally simple:
- one main endpoint
- one health endpoint
- a layered internal pipeline
- thin provider abstraction
- structured error model
- no persistent application state
- no unnecessary infrastructure overhead

This gives the project a clean and maintainable backend foundation while staying fully aligned with the MVP scope and the product’s spoiler-safe architecture.

