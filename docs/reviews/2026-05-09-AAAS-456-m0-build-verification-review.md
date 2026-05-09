# AAAS-456: M0 Monorepo Build Verification Review

**Date:** 2026-05-09
**Reviewer:** Parrot (QA)
**Branch verified:** `main` (HEAD: `0fab34948`)

## Review: CHANGES REQUESTED

## Verification performed

1. Checked for `pnpm-workspace.yaml` — **NOT FOUND** on main
2. Checked for `pnpm-lock.yaml` — **NOT FOUND** on main
3. Checked for `packages/*/package.json` — **NOT FOUND** (dirs contain only node_modules, no source)
4. Ran `pnpm install --no-frozen-lockfile` — succeeds (installs root devDeps only, no workspace packages)
5. Ran mobile typecheck — **FAILS** (6 errors)
6. Ran mobile tests — **FAILS** (3/7 suites fail to load, 82/91 tests pass)

## Blocker: Monorepo workspace not configured

Without `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `packages/*/package.json`, there is no monorepo to verify. The root `pnpm --recursive typecheck` and `pnpm --recursive test` scripts are non-functional.

## Typecheck errors (mobile)

| File | Error |
|---|---|
| `HomeworkFeedbackCard.tsx:15` | Cannot find module `@/components/Skeleton` |
| `HomeworkFeedbackCard.tsx:263,270,291` | `'help' is possibly 'undefined'` |
| `kidProfiles.ts:1` | Cannot find module `expo-sqlite` |
| `parentSessions.ts:1` | Cannot find module `expo-sqlite` |

## Test failures (mobile)

- 3 suites fail to load due to missing mocks / expo-sqlite import errors
- 82 of 91 tests pass in the suites that load
- ParentPinSetupScreen has assertion mismatches (expected `654321`, received `123456`)

## Required fixes

1. Merge `feat/aaas-752-pnpm-workspace-integrity` into main (adds workspace config + package scaffolding)
2. Fix mobile typecheck errors (missing imports, type narrowing for `help`)
3. Fix mobile test failures (expo-sqlite mock, ParentPinSetupScreen assertions)
4. Re-run full `pnpm typecheck` + `pnpm test` after workspace is configured
5. Attach build output evidence

## Route to

Owner: Bee (Coder) — implement workspace fix and typecheck/test fixes
