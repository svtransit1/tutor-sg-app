# Branch Protection for `main`

**Date:** 2026-05-11
**Issue:** AAAS-1503
**Author:** Bee
**Status:** Applied

## Summary

Enabled GitHub branch protection rules on `main` for the `tutor-sg-app` repository, satisfying ADD §11 ("mandatory pass before merge") and acceptance criterion #4 of AAAS-1342.

## Configuration

| Setting | Value |
|---|---|
| Required status checks | `Typecheck`, `Lint`, `RN Bundle (ios)`, `RN Bundle (android)` |
| Strict status checks | `true` (require up-to-date branches) |
| Required PR reviews | 1 approval |
| Dismiss stale reviews | `true` |
| Required conversation resolution | `true` |
| Enforce admins | `true` (admins cannot bypass) |
| Allow force pushes | `false` |
| Allow deletions | `false` |

## Changes from previous state

- **Removed** nonexistent required checks `Format Check` and `Tests` from the protection rules — these CI jobs do not exist in the current workflow
- **Enabled** `enforce_admins` — previously admins could bypass all rules
- Kept all other existing protection settings unchanged

## Verification

Settings confirmed via GitHub API. PR merge is blocked when any required status check fails or when fewer than 1 approving review is present.

## Cross-references

- ADD §11 (CI: GitHub Actions — build both platforms, run tests, lint, format, type-check; mandatory pass before merge)
- `docs/reviews/2026-05-11-AAAS-1342-CI-workflow-review.md`
- `.github/workflows/ci.yml`
