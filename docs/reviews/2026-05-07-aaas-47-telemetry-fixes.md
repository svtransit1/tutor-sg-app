# AAAS-47 M2-10: Telemetry events for onboarding funnel — Review fix record

**Date**: 2026-05-07
**Agent**: 🐝 Bee (Mobile Coder #2)
**Branch**: `feat/aaas-47-onboarding-telemetry`
**Commit**: HEAD (after stash pop + all fixes)

## Previous review (by Parrot, 2026-05-06)

Four issues were raised:

| # | Issue | Status |
|---|-------|--------|
| R1 | Missing events: `consent_given`, `first_homework_submitted`, `first_feedback_received` | ✅ Fixed |
| R2 | `_layout.tsx` missing TelemetryProvider; only DeviceTierScreen has telemetry | ✅ Fixed |
| R3 | OnboardingProvider fires zero automatic events; `useOnboardingTelemetry.ts` is a stub | ✅ Fixed |
| R4 | Tests crash — uuid v14 ESM not handled in Jest config | ✅ Fixed (ts-jest reinstalled, working) |

## Changes made

### R1 — Add missing events

**Files**: `mobile/src/services/telemetry.ts`, `mobile/src/services/__tests__/telemetry.test.ts`

- Added `consent_given`, `first_homework_submitted`, `first_feedback_received` to `OnboardingEventName` union type.
- Added 3 new test cases validating event name + property structure.

### R2 — TelemetryProvider wrapper

**Files**: `mobile/app/_layout.tsx`

- Wrapped `OnboardingProvider` with `<TelemetryProvider>` at the root layout level.
- Now `useTelemetry()` is available to every screen in both `(onboarding)` and `(app)` route groups.

### R3 — Wire automatic lifecycle telemetry

**Files**:

- `mobile/src/onboarding/useOnboardingTelemetry.ts` — Rewrote from stub to full hook:
  - `useOnboardingTelemetry()`: fires `onboarding_started` on mount, `onboarding_step_viewed` / `onboarding_step_completed` on forward transitions, `onboarding_back_navigated` on backward transitions, `onboarding_completed` when done.
  - Exports convenience functions: `trackConsentGiven()`, `trackFirstHomeworkSubmitted()`, `trackFirstFeedbackReceived()`.

- `mobile/src/onboarding/screens/OnboardingOrchestrator.tsx` — Added `useOnboardingTelemetry()` call with `previousStepRef`.

- `mobile/src/onboarding/screens/ConsentScreen.tsx` — Added `useTelemetry()`: calls `setOptIn(telemetryOptIn)` before firing `consent_given`.

- `mobile/src/onboarding/screens/FirstHomeworkScreen.tsx` — Added `useTelemetry()`: fires `first_homework_submitted` on "Let's go!" tap.

- `mobile/app/(app)/feedback.tsx` — Added `useTelemetry()`: fires `first_feedback_received` on first successful feedback load.

### R4 — Jest configuration stability

- Reinstalled `ts-jest` via pnpm to fix missing dist directory in pnpm store.
- `jest.config.js` uses `require.resolve('ts-jest')` in transform config.

## Test results

```
Test Suites: 4 passed, 4 total (excluding pre-existing LanguageSelectScreen type error)
Tests:       99 passed, 99 total
```

Key suites:
- `src/services/__tests__/telemetry.test.ts` — 24 tests ✅ (21 original + 3 new)
- `src/onboarding/__tests__/machine.test.ts` — 39 tests ✅
- `src/services/__tests__/deviceTier.test.ts` — 26 tests ✅
- `src/storage/__tests__/kid-profile.test.ts` — 10 tests ✅

## Verification

- Zero PII in event properties confirmed by existing PII test.
- All events gated by `setOptIn(true)` — no opt-in = zero egress.
- Backward-compatible: existing screen behavior unchanged.

## Next action

Ready for re-review by Parrot or Owl. Issue marked `in_review`.
