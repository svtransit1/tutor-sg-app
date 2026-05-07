# Review: AAAS-305 — M2-28: Parent PIN gate (setup flow + authentication)

**Reviewer:** 🐺 Wolf
**Branch:** `feat/aaas-305-parent-pin-gate`
**Commit:** `d28f23e` — `[wolf] AAAS-305: M2-28 — Parent PIN gate (setup flow + authentication)`
**Date:** 2026-05-07

## Summary

Implements the Parent PIN gate feature for tutor-sg. Two screens + storage layer + integration:

- **PinSetupScreen** — Two-step PIN creation wizard (enter 4-digit PIN → confirm → save to secure store). Optional skip link for onboarding.
- **PinGateScreen** — PIN authentication gate for accessing the parent area. 5 failed attempts → 60-second cooldown with live countdown timer.
- **ParentDashboardScreen** — Placeholder dashboard (will be expanded in M3 with session log).
- **pin-storage.ts** — Secure PIN storage via `expo-secure-store` with constant-time comparison, failed-attempts tracking, and lockout mechanism.
- **i18n** — Added 11 new keys to `parent.json` (EN + zh-Hans) for PIN UI strings. Updated `TranslationInterpolationMap` in `types.ts`.
- **App.tsx** — Integrated parent area navigation: main screen → PIN check → setup or gate → dashboard.
- **Tests** — 33 tests (pin-storage: 17, PinGateScreen: 6, PinSetupScreen: 7) covering storage operations, lockout behavior, and UI interactions.

## Files changed (new)

| File                                                  | Lines | Purpose                                       |
| ----------------------------------------------------- | ----- | --------------------------------------------- |
| `mobile/src/parent/pin-storage.ts`                    | 175   | Secure PIN storage + lockout logic            |
| `mobile/src/parent/PinSetupScreen.tsx`                | 490   | PIN setup wizard (enter → confirm → save)     |
| `mobile/src/parent/PinGateScreen.tsx`                 | 481   | PIN authentication gate with cooldown         |
| `mobile/src/parent/ParentDashboardScreen.tsx`         | 174   | Placeholder parent dashboard                  |
| `mobile/src/parent/__tests__/pin-storage.test.ts`     | 187   | Storage unit tests                            |
| `mobile/src/parent/__tests__/PinGateScreen.test.tsx`  | 141   | Gate UI tests                                 |
| `mobile/src/parent/__tests__/PinSetupScreen.test.tsx` | 150   | Setup UI tests                                |
| `mobile/__mocks__/react-native.js`                    | 128   | RN mock for vitest (avoids Flow parse errors) |
| `mobile/vitest.config.mjs`                            | 21    | Vitest config for mobile package              |
| `mobile/vitest.setup.ts`                              | 54    | Global Expo/RN mocks                          |

## Files modified

| File                                            | Change                      | Purpose                                   |
| ----------------------------------------------- | --------------------------- | ----------------------------------------- |
| `mobile/App.tsx`                                | Integrated parent area flow | Main → PIN check → setup/gate → dashboard |
| `mobile/package.json`                           | Added deps                  | expo-secure-store, vitest                 |
| `mobile/tsconfig.json`                          | Updated include             | Added src/ to compilation                 |
| `packages/i18n/src/locales/en/parent.json`      | +11 keys                    | PIN-related UI strings                    |
| `packages/i18n/src/locales/zh-Hans/parent.json` | +11 keys                    | PIN-related UI strings (CN)               |
| `packages/i18n/src/types.ts`                    | +6 entries                  | Interpolation types for new keys          |

## Verification

- **pnpm -r test** — All 97 tests pass across monorepo (i18n: 40, mobile: 33, llm: 24)
- **Lockout behavior** — verifyPin() correctly reaches 5→lock, resets after cooldown
- **Constant-time comparison** — pin-storage uses XOR-based comparison
- **Bilingual** — All new strings have both EN and zh-Hans counterparts
- **Accessibility** — accessibilityRole, accessibilityLabel, accessibilityLiveRegion used throughout
- **No analytics SDKs** — No new analytics or data-leaving-device code paths
- **Kid-safe** — No photos, OCR text, or child data touches these screens

## Next reviewer

Assign to **Tortoise** for formal PR review per Fleet Review Protocol.
