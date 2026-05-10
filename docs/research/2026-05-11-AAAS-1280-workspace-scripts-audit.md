# Monorepo Workspace Scripts Audit

**Issue:** AAAS-1280 M0-103  
**Date:** 2026-05-11  
**Author:** Bee  
**Branch:** `bee/aaas-1280-scripts-audit`  
**Commit:** `1b2fb0179` (latest)

## Verification

```
pnpm --recursive typecheck  ✅  (mobile + shared pass)
pnpm --recursive test        ✅  (11 suites, 179 tests)
```

## What was fixed

### Typecheck (6 TS errors)
- `mobile/app/(kid)/home.tsx` — fixed `TFunction` parameter type. Helper functions
  `timeAgo` and `formatTimeSpent` declared `t` as `(key: string, opts?: object) => string`
  which is incompatible with i18next's `TFunction` type. Changed to `TFunction` from i18next.
- `mobile/app/(kid)/history.tsx` — same fix.

### Tests (2 failures -> 0)
- `FirstUseWalkthrough.test.tsx` — `getByLabelText('tutorial.stepIndicator')` failed
  because i18next mock returns the options object when the key is not in the mock map.
  Added `'tutorial.stepIndicator': 'Step {current} of {total}'` to mock and changed
  test to `getByLabelText('Step {current} of {total}')`.
- `HomeworkFeedbackCard.test.tsx` — `getByText('common.retry')` failed because the
  mock returns `'Retry'` (the fallback value from `t('common.retry', 'Retry')`).
  Changed to `getByLabelText('homeworkError.retry')` which checks the button's
  accessibility label.

### Config scaffolding for packages
- `packages/shared/tsconfig.json` — added (shared has real source code)
- `packages/device-tier/tsconfig.json` — added (device-tier has real source code)
- `packages/device-tier/vitest.config.ts` — added (test files use `*.vitest.ts` naming)
- `packages/device-tier/src/index.ts` — added with `assignTier`, `buildCapabilities`
  exports (referenced by detection.vitest.ts test)
- `tsconfig.base.json` — added for consistent package tsconfigs
- Removed `typecheck` script from `packages/features` and `packages/llm` (no source code)

### Dependencies
- `expo-sqlite` added to mobile (used by storage modules)
- `expo-modules-core` added to mobile (peer dep of tutor-sg-device-info module)

## Pre-existing issues out of scope
- `ParentDashboardScreen.test.tsx` — fails on `main` too (unrelated to audit)
