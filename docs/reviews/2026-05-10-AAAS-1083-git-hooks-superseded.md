# Review: AAAS-1083 — M0: Git hooks — pre-commit lint-staged + typecheck

**Reviewer:** Bee
**Date:** 2026-05-10
**Branch:** N/A — superseded
**Commit:** N/A
**Author:** Bee

**Verdict: APPROVED (closed as superseded)**

## Verification

- Git hooks confirmed on `main`:
  - `git show main:.husky/pre-commit` → `npx lint-staged` ✅
  - `git show main:package.json` → `"prepare": "husky"` + `lint-staged` config ✅
- AAAS-1083 branch `feat/git-hooks` has incremental compilation enhancement (`mobile/tsconfig.json incremental + tsBuildInfoFile`) but this is not on main

## Decision

AAAS-795 git hooks were merged to main via AAAS-1135 M2 stack merge before AAAS-1083 was resubmitted. AAAS-1083 is a duplicate implementation. Close as superseded.

## Required actions

None — feature already shipped. File separate enhancement if incremental compilation is desired.
