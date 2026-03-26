# Plan 0002 — Bootstrap Workspace Verification Fixes

## Status
In progress.

## Goal
Bring the Epic 00 bootstrap slices to a verifiable state on a dedicated fix branch.

## Scope
- fix malformed workspace package manifests
- repair any narrow bootstrap/tooling blockers exposed by verification
- rerun workspace lint, typecheck, build, and tests
- close verified Epic 00 GitHub issues if the done criteria are met

## Non-goals
- no new feature work from later milestones
- no contract redesign
- no reader/PDF.js behavior expansion
- no backend pipeline changes beyond bootstrap verification needs

## Execution order
1. Fix manifest and tooling blockers preventing `pnpm` from running.
2. Run workspace verification commands and inspect any failures.
3. Apply only the minimal follow-up fixes needed for Epic 00.
4. Update the GitHub bootstrap issues based on actual verification results.

## Risks
- verification may expose pre-existing non-bootstrap failures in later-slice code
- untracked generated artifacts may add noise while validating the repo state

## Mitigations
- keep fixes constrained to Epic 00 acceptance criteria
- report any later-slice failures separately instead of folding them into this scope
