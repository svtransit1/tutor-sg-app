# Review Handoff: AAAS-252 — PARENT_PIN_SETUP screen (onboarding step 3/7)

**Author:** Flutter (UX)
**Date:** 2026-05-07
**Branch:** `feat/aaas-252-parent-pin-setup`
**Commit:** d8bd03b

## Files changed

| File | Purpose |
|---|---|
| `mobile/app/(onboarding)/parent-pin-setup.tsx` | Expo Router route for step 3/7 |
| `mobile/src/screens/onboarding/ParentPinSetupScreen.tsx` | Main screen component |
| `mobile/src/storage/pin-storage.ts` | Secure PIN storage utility (expo-secure-store) |
| `mobile/src/screens/onboarding/__tests__/ParentPinSetupScreen.test.tsx` | 12 unit tests |
| `mobile/src/i18n/locales/en.json` | Added `onboarding.parentPinSetup.*` keys |
| `mobile/src/i18n/locales/zh-Hans.json` | Added `onboarding.parentPinSetup.*` keys (zh-Hans) |

## What was built

Per First-90-Seconds Onboarding Dev Spec §3.4:

1. **Two-step 4-digit PIN entry** — enter → re-enter to confirm
2. **Mismatch handling** — visual error text + state reset to enter step after 800ms
3. **Secure storage** — PIN saved via `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android)
4. **Skip option** — "Skip — set up later" link at bottom; defers PIN setup
5. **Confirm-step back navigation** — link during confirm step to go back and re-enter
6. **Bilingual** — all strings in EN + zh-Hans
7. **Accessibility** — digit slots, keypad buttons, and skip link have `accessibilityRole="button"` and descriptive `accessibilityLabel`

## What was verified

- **Unit tests:** 12/12 passing (all 43 across 4 suites)
- **States tested:**
  - Default render (title, body, enter prompt, 4 empty slots, keypad, skip link)
  - Progressive digit entry (stays in enter until 4 digits)
  - Auto-advance to confirm step
  - Matching PIN → `savePin` called → `onComplete` fires
  - Mismatch → error shown → reset to enter step
  - Backspace removal
  - Skip link fires `onSkip`
  - Accessibility labels on all interactive elements
- **Privacy:** No child data leaves device. PIN never stored in MMKV/SQLite.
- **Existing tests:** No regressions (all AgeGateScreen, DeviceTierScreen, KidHomeScreen tests pass)

## Reviewer requests

- Verify the PIN storage integration (expo-secure-store mock in tests)
- Confirm the accessibility labels follow project conventions
- Check that the i18n keys match the naming convention used in other onboarding screens

## Next

Assign to Tortoise for review.
