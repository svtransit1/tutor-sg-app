# AAAS-473 — M2-66: Parent PIN gate — setup during onboarding

Review: APPROVED

Branch: `feat/aaas-473-parent-pin-gate-v2`
Owner: Bee

## Deliverables

| File | Purpose |
|------|---------|
| `mobile/src/storage/pin-storage.ts` | Enhanced with lockout/cooldown (5→60s), constant-time compare |
| `mobile/src/storage/__tests__/pin-storage.test.ts` | 15 tests: save, verify, cooldown, clear |
| `mobile/src/parent/pin-storage.ts` | Re-exports enhanced storage |
| `mobile/src/parent/PinSetupScreen.tsx` | PIN setup: enter→confirm, shake on mismatch, skippable |
| `mobile/src/parent/PinGateScreen.tsx` | PIN gate: 5-fail lockout, 60s cooldown, numeric keypad |
| `mobile/src/parent/ParentDashboardScreen.tsx` | Dashboard placeholder (M3) |
| `mobile/app/(parent)/_layout.tsx` | Parent layout: gate then Stack |
| `mobile/app/(parent)/dashboard.tsx` | Dashboard route |

## Spec coverage

- Two-step enter→confirm, shake+mismatch reset (Article 12 §3.4)
- PIN in Keychain/SecureStore (never plaintext, never SQLite)
- Skip link (skippable prop, shown in onboarding)
- Parent area PIN gate (5 failed → 60s cooldown, ADD §5.2)
- Bilingual (i18n keys already exist), a11y labels

## Test results

All 15 storage tests pass. Pre-existing failures (ParentSignInScreen, KidHomeScreen) unrelated.

## Handoff

Commit includes: enhanced storage with cooldown, parent/* screens, parent routes, tests, review doc. Next: Flutter for visual review.
