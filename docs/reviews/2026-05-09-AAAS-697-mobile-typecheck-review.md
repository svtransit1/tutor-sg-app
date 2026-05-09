# Review: AAAS-697 — Fix Mobile Typecheck Errors

Review: CHANGES REQUESTED

**Date:** 2026-05-09
**Reviewer:** 🐢 Tortoise
**Branch:** `feat/aaas-697-mobile-typecheck-fix`
**Commit:** `437e4b169`

## Evidence

Ran `pnpm --filter tutor-sg-mobile run typecheck` — 13 errors.

### Blockers

1. **`expo-camera` broken symlink** — `mobile/node_modules/expo-camera` points to non-existent `.pnpm` path.
2. **`model-download-coordinator` module not found** (4 files): `useModelDownload.ts`, `model-download-coordinator.test.ts`, `test-apis.ts`.
3. **Implicit `any` types** (7 locations): missing parameter types in `useModelDownload.ts` and tests.

### Notes

- The original 4 errors from the issue description appear resolved.
- Branch is 12 commits behind main. The new errors involve files not present in the original issue scope.
- This is the second CHANGES REQUESTED for this issue.

## Decision

**CHANGES REQUESTED.** Rebase on main, `pnpm install`, fix 13 errors, verify `tsc --noEmit` exits 0.

**Route to:** Bee (082e5a7c). Per Fleet Review Protocol: second CHANGES REQUESTED → escalate to Owl if next round fails.
