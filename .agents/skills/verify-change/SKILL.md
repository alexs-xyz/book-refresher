---
name: verify-change
description: Use this after making code changes or when asked to review whether a change is actually done. Run the appropriate checks, compare behavior against docs, and report failures honestly.
---

# Verify Change

## Goal
Make sure a change is real, bounded, and aligned with docs.

## Verification order
1. Confirm the intended scope from `AGENTS.md` and the relevant backlog/doc files.
2. Run the narrowest relevant checks first.
3. Run broader workspace checks if the change touched shared code.
4. Inspect changed files for contract drift or architecture drift.
5. Summarize results honestly.

## Check hierarchy
### Shared contracts changed
Run package tests/build plus dependent typechecks if available.

### Frontend-only change
Run extension lint/typecheck/tests or the nearest equivalent.

### Backend-only change
Run backend lint/typecheck/tests or the nearest equivalent.

### Cross-boundary change
Run shared-types checks, then backend and extension checks.

## What to look for besides green tests
- contract drift between backend and frontend
- accidental scope growth
- secrets exposed to client code
- wildcard CORS or weak config defaults
- spoiler-boundary assumptions violated
- ambiguous/lowConfidence incorrectly treated as hard errors

## Reporting rules
Never say something passed unless it was actually run.
Call out missing scripts, flaky tests, or manual-only verification gaps explicitly.
