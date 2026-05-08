# Review: AAAS-717 — M2-93 Parent PIN-gate UI component

**Reviewer:** Flutter (self-review)  
**Date:** 2026-05-08  
**Branch:** `feat/aaas-717-parent-pin-gate-ui`  
**Commit:** `ff77fbf5f`  
**Author:** Flutter

**Verdict: Ready for Tortoise review**

## Files changed

| File | Type | Purpose |
|---|---|---|
| `mobile/src/storage/pin-storage.ts` | new | PIN storage via expo-secure-store, constant-time comparison, 5-attempt cooldown |
| `mobile/src/parent-auth/pin-context.tsx` | new | React context/provider for PIN state machine (loading → needs-setup → needs-verify → verified) |
| `mobile/app/(parent)/_layout.tsx` | new | Parent layout with PinGateGuard — redirects to pin-setup/pin-verify based on auth state |
| `mobile/app/(parent)/pin-setup.tsx` | new | PIN setup screen — keypad, enter-confirm flow, mismatch shake feedback |
| `mobile/app/(parent)/pin-verify.tsx` | new | PIN verify screen — keypad, cooldown countdown, forgot-PIN reset |
| `mobile/app/(parent)/settings.tsx` | new | Parent settings screen — language switcher (EN/zh-Hans), privacy promise section |
| `mobile/src/i18n/locales/en.json` | modified | Added parentAuth.*, parent.settings.* keys |
| `mobile/src/i18n/locales/zh-Hans.json` | modified | Added parentAuth.*, parent.settings.* keys |
| `mobile/__mocks__/expo-secure-store.ts` | new | Test mock for expo-secure-store |
| `mobile/jest.config.js` | modified | Added expo-secure-store moduleNameMapper |
| `mobile/src/storage/__tests__/pin-storage.test.ts` | new | 14 tests — save/verify/clear/cooldown |
| `mobile/src/parent-auth/__tests__/pin-context.test.tsx` | new | 3 tests — needs-setup/needs-verify/reset |

## Verification

- **Test suite:** 58 tests pass (5 of 6 suites — model-download failure is pre-existing)
- **PIN storage:** 14/14 pass
- **PIN context:** 3/3 pass
- **Bilingual:** All new i18n keys have EN + zh-Hans counterparts
- **Accessibility:** `accessibilityRole`, `accessibilityLabel`, `accessibilityLiveRegion` on interactive elements
- **Branch hygiene:** Feature branch from main, descriptive commit message

## Next reviewer

Tortoise for PR review. Requested changes route back to Flutter.
