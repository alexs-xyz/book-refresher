# Book Refresher Shared Types + API Schema Package Specification

## Project Frame
Book Refresher is being built as a **custom PDF.js-based browser reader** with **Book Refresher** as the first integrated tool.

This document defines the purpose, scope, structure, and recommended contents of the shared types / API schema package so implementation can begin with stable contracts across frontend and backend.

---

## 1. Purpose

The shared types package exists to provide a single source of truth for the cross-boundary contracts used by:
- the reader frontend
- the backend API
- tests
- future tooling around the Book Refresher request/response flow

The package should prevent contract drift across the system.

Its job is to centralize:
- API request/response types
- mode enums
- public error shapes
- selected shared domain types that are truly used on both sides

It should **not** become a dumping ground for arbitrary internal types.

---

## 2. Design Principles

### 2.1 Share Only What Is Truly Shared
If a type is used only inside the frontend or only inside the backend, it should stay there.

The shared package should contain only types/schemas that improve contract stability across boundaries.

### 2.2 Public Contract First
The most important responsibility of the package is the public API contract between frontend and backend.

### 2.3 Runtime Validation Where It Matters
For API inputs and outputs, use schemas that can support both:
- static typing
- runtime validation

### 2.4 Backend Internals Do Not Belong Here
Internal backend pipeline structures such as:
- evidence block internals
- provider adapter internals
- internal error subclasses
- retrieval-stage intermediate objects

should remain in the backend codebase.

### 2.5 Frontend UI Internals Do Not Belong Here
Purely visual/UI-local types such as:
- popup positioning state
- DOM range wrappers
- component props for internal-only components

should remain in the frontend codebase.

### 2.6 Stable Naming
The shared package should prefer explicit, versionable names and avoid vague “data” or “payload” labels where possible.

---

## 3. Package Role in the Monorepo

### 3.1 Package Name
Recommended package:
- `packages/shared-types`

### 3.2 Primary Consumers
- `apps/extension`
- `apps/backend`
- test suites

### 3.3 Package Responsibilities
The package should define:
- request and response contracts for `POST /api/refresher`
- response contract for `GET /api/health`
- public mode/type enums
- shared document/session identifiers if needed across app boundaries
- public error object shape

### 3.4 Package Non-Responsibilities
The package should not define:
- frontend component props unless truly shared
- backend service-layer result objects unless truly shared
- provider-specific request/response objects
- PDF.js-specific adapter types
- browser-extension runtime-specific types

---

## 4. Recommended Package Structure

```text
packages/shared-types/
  src/
    api/
      refresher/
        refresher.schemas.ts
        refresher.types.ts
        refresher.enums.ts
      health/
        health.schemas.ts
        health.types.ts
    common/
      error.schemas.ts
      error.types.ts
      result.types.ts
      ids.types.ts
    reader/
      document.types.ts
      selection.types.ts
    index.ts
  package.json
  tsconfig.json
```

This structure keeps API contracts primary while still leaving room for a small set of supporting shared domain types.

---

## 5. Technology Choice for Shared Contracts

## 5.1 Recommended Approach
Use:
- **Zod schemas** for runtime-validatable API shapes
- **TypeScript inferred/exported types** derived from those schemas where possible

### Why
This gives:
- a single definition point for request/response contracts
- validation support in the backend
- type-safe consumption in the frontend
- fewer duplicated interfaces

### Rule
When a type corresponds to a runtime API contract, prefer schema-first.

When a type is purely compile-time and not validated at runtime, plain TypeScript types are acceptable.

---

## 6. Core Shared Contract Areas

The shared package should contain five main contract areas:

1. refresher request/response API
2. health endpoint API
3. common public error/result objects
4. common identifier/value types
5. a very small set of reader domain types if truly shared

---

## 7. Refresher API Contract

## 7.1 Request Schema
The refresher request should be the primary contract in the package.

### Required fields
- `requestId`
- `documentId`
- `selectedText`
- `selectedPage`
- `localContext`
- `prefixText`

### Optional fields
- `chosenCandidateId`
- `documentMeta`

### Recommended schema shape
```ts
{
  requestId: string;
  documentId: string;
  selectedText: string;
  selectedPage: number;
  localContext: string;
  prefixText: string;
  chosenCandidateId?: string | null;
  documentMeta?: {
    fileName?: string;
    pageCount?: number;
  };
}
```

### Notes
- `selectedPage` should be a positive integer
- `chosenCandidateId` should be nullable/optional to support both initial and ambiguity-follow-up flows
- `documentMeta` must remain optional and non-essential for correctness

---

## 7.2 Response Envelope Schema
All responses should share a consistent top-level envelope.

### Recommended envelope
```ts
{
  requestId: string;
  status: 'ok' | 'error';
  mode: RefresherMode | null;
  data: RefresherResponseData | null;
  error: PublicError | null;
}
```

### Notes
- `mode` is only populated when `status='ok'`
- `data` is only populated when `status='ok'`
- `error` is only populated when `status='error'`

---

## 7.3 Refresher Mode Enum
The package should define a public mode enum or literal union.

### Recommended values
- `normal`
- `sparse`
- `ambiguous`
- `lowConfidence`

### Important Rule
`error` should **not** be part of the success-mode enum.

That distinction belongs at the `status` level.

---

## 7.4 Success Data Variants
The success `data` shape should be a discriminated union keyed by `mode` at the outer envelope level.

### Normal mode data
```ts
{
  resolvedName: string;
  summaryParagraph: string;
  bullets: string[];
  relatedEntities: string[];
  pageReferences: number[];
}
```

### Sparse mode data
```ts
{
  resolvedName: string;
  summaryParagraph: string;
  bullets: string[];
  relatedEntities: string[];
  pageReferences: number[];
}
```

### Ambiguous mode data
```ts
{
  selectedText: string;
  choices: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}
```

### Low-confidence mode data
```ts
{
  message: string;
}
```

### Recommendation
For `normal` and `sparse`, keep the shape aligned to reduce frontend branching.

---

## 7.5 Public Error Object
The shared package should define the public error object shape used by the backend API.

### Recommended shape
```ts
{
  code: string;
  message: string;
  retryable: boolean;
}
```

### Notes
- keep this compact
- backend internal error families should remain private to the backend package
- only the normalized public error object belongs here

---

## 7.6 Candidate Choice Type
Because ambiguity follow-up is part of the API flow, the candidate choice shape should be explicitly reusable.

### Recommended type
```ts
{
  id: string;
  label: string;
  description?: string;
}
```

This should live in the refresher contract area, not as a generic global type.

---

## 8. Health API Contract

## 8.1 Purpose
The health endpoint contract should be small and stable.

### Recommended response shape
```ts
{
  status: 'ok';
  service: string;
  environment?: string;
  version?: string;
}
```

### Notes
- do not expose sensitive config
- keep this endpoint simple
- only include safe metadata

---

## 9. Common Shared Types

These should stay small and purposeful.

## 9.1 Public Error Type
Defined once and reused by API contracts.

## 9.2 Request/Document IDs
If shared helpers or branded types are useful, define compact ID aliases.

### Example
```ts
export type RequestId = string;
export type DocumentId = string;
export type CandidateId = string;
```

Do not overengineer this into a complex nominal-type system unless implementation later proves it worthwhile.

## 9.3 Basic Result Helpers
A small shared `ApiEnvelope` generic may be useful.

### Example
```ts
type ApiEnvelope<TData, TMode extends string> = {
  requestId: string;
  status: 'ok' | 'error';
  mode: TMode | null;
  data: TData | null;
  error: PublicError | null;
};
```

This is optional, but useful if kept simple.

---

## 10. Reader Domain Types: What Belongs Here vs What Does Not

The reader/frontend has many types, but only a few may be worth sharing.

## 10.1 Good Candidates for Sharing
Only if both sides or tests benefit:
- `DocumentMeta`
- request-bound selection payload shapes
- maybe a compact `DocumentSessionInfo` if used across boundaries

## 10.2 Not Good Candidates for Sharing
Do **not** move these into shared-types:
- DOM `Range` wrappers
- popup anchor rect state
- PDF.js-specific objects
- local popup/UI mode state beyond API response mode
- selection controller internals

### Rule of thumb
If a type mentions browser DOM, PDF.js internals, or a React component concern, it probably should not live in shared-types.

---

## 11. Recommended Export Strategy

The package should provide a clean `index.ts` that re-exports the stable public surface.

### Example export groups
- refresher request/response schemas
- health schemas/types
- public error type/schema
- common ID aliases/types

### Recommendation
Consumers should usually import from package-level public exports rather than reaching deep into file paths.

This allows internal package reorganization later with less churn.

---

## 12. Suggested Concrete File Breakdown

## 12.1 `src/api/refresher/refresher.enums.ts`
Contains:
- `RefresherMode`
- `ApiStatus` if kept as enum/union helper

## 12.2 `src/api/refresher/refresher.schemas.ts`
Contains:
- request schema
- response envelope schema
- normal/sparse/ambiguous/lowConfidence data schemas
- candidate choice schema

## 12.3 `src/api/refresher/refresher.types.ts`
Contains:
- inferred request/response types from schemas
- optional envelope helper types

## 12.4 `src/api/health/health.schemas.ts`
Contains:
- health response schema

## 12.5 `src/api/health/health.types.ts`
Contains:
- inferred health response type

## 12.6 `src/common/error.schemas.ts`
Contains:
- public error schema

## 12.7 `src/common/error.types.ts`
Contains:
- inferred public error type

## 12.8 `src/common/ids.types.ts`
Contains:
- request/document/candidate ID aliases if useful

## 12.9 `src/reader/document.types.ts`
Optional, only for genuinely shared document/session value shapes

## 12.10 `src/reader/selection.types.ts`
Optional, only for request-bound shared selection payload fragments

---

## 13. Recommended Naming Conventions

### 13.1 Schema Names
Use explicit schema names such as:
- `refresherRequestSchema`
- `refresherResponseSchema`
- `publicErrorSchema`
- `healthResponseSchema`

### 13.2 Type Names
Use explicit type names such as:
- `RefresherRequest`
- `RefresherResponse`
- `RefresherNormalData`
- `RefresherAmbiguousData`
- `PublicError`
- `HealthResponse`

### 13.3 Avoid Generic Names
Avoid vague names like:
- `Data`
- `Payload`
- `ResponseModel`
- `ResultThing`

Be explicit. This package is supposed to stabilize the contract surface.

---

## 14. Versioning and Change Discipline

## 14.1 Why This Matters
The shared package is the contract boundary. Small changes here can ripple through frontend and backend quickly.

## 14.2 Recommended Discipline
When changing shared schemas/types:
- update frontend and backend together in the same change set where possible
- treat breaking contract changes intentionally
- avoid casual field renames

## 14.3 Breaking Change Examples
Examples of breaking changes:
- renaming `selectedText`
- changing `mode` semantics
- removing `chosenCandidateId`
- changing the public error object shape

These changes should be treated deliberately.

---

## 15. Testing Strategy for Shared Contracts

## 15.1 Schema Validation Tests
Add tests that confirm:
- valid refresher requests parse correctly
- invalid requests fail as expected
- each response mode validates correctly
- error envelope validates correctly

## 15.2 Cross-Boundary Contract Tests
Use the shared package directly in:
- backend route validation tests
- frontend API client tests

This helps ensure both sides interpret the same shapes the same way.

## 15.3 Snapshot-Like Contract Examples
It may be useful to keep a few example payload fixtures for:
- normal
- sparse
- ambiguous
- lowConfidence
- error

These can be used across tests and docs.

---

## 16. Recommended Initial Package Contents

For MVP, the shared package should start with:

### Required
- refresher request schema/type
- refresher response envelope schema/type
- normal/sparse/ambiguous/lowConfidence data schemas/types
- public error schema/type
- health response schema/type
- mode enum/literal union

### Optional but useful
- candidate choice type/schema
- simple ID aliases
- small API envelope helper type
- optional `DocumentMeta` schema/type

### Explicitly avoid initially
- frontend component props
- backend pipeline internals
- PDF.js types
- DOM selection types
- provider adapter types

---

## 17. Example Public Exports

A clean package-level export surface might look conceptually like:

```ts
export * from './api/refresher/refresher.enums';
export * from './api/refresher/refresher.schemas';
export * from './api/refresher/refresher.types';
export * from './api/health/health.schemas';
export * from './api/health/health.types';
export * from './common/error.schemas';
export * from './common/error.types';
export * from './common/ids.types';
```

This is not mandatory, but the package should provide a clear public surface.

---

## 18. Example Minimal First Implementation Set

A practical first implementation of this package could be:

```text
packages/shared-types/
  src/
    api/
      refresher/
        refresher.enums.ts
        refresher.schemas.ts
        refresher.types.ts
      health/
        health.schemas.ts
        health.types.ts
    common/
      error.schemas.ts
      error.types.ts
      ids.types.ts
    index.ts
```

This is enough to start implementation safely.

Additional shared reader/domain types can be added later only if a real need emerges.

---

## 19. Deliberate Non-Goals

The shared package is **not** meant to become:
- a global dumping ground for every type in the codebase
- a mirror of backend internals
- a mirror of frontend UI internals
- a place for provider-specific models
- a place for PDF.js adapter types

If the package starts growing in that direction, it is being misused.

---

## 20. Summary

The shared types / API schema package should do one thing very well:

**freeze the cross-boundary contracts between the reader frontend and the backend API.**

For Book Refresher V1, that means primarily:
- the refresher request schema
- the refresher response schema
- the public error object
- the health endpoint shape
- a very small number of supporting shared types

The package should stay:
- small
- explicit
- schema-driven where it matters
- strict about what belongs in it

That is what will let implementation start with stable contracts instead of contract drift.

