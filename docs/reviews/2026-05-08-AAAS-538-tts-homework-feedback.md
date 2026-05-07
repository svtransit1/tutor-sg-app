# AAAS-538 Review — On-device TTS playback for homework feedback

**Date:** 2026-05-08  
**Reviewer:** Tortoise  
**Branch:** `feat/aaas-540-homework-session-persistence` @ `5ce88d34e`  
**Verdict:** CHANGES REQUESTED

## Acceptance Criteria Matrix

| # | Criterion | Result |
|---|-----------|--------|
| 1 | "Listen" button on feedback screen plays feedback via TTS | PASS |
| 2 | Correct language voice (EN vs zh-Hans) | PASS |
| 3 | Stops when navigating away | FAIL |
| 4 | Works offline (airplane mode) | PASS |

## Files Reviewed

| File | Status |
|------|--------|
| `mobile/src/components/ReadAloudButton.tsx` | Reviewed |
| `mobile/src/components/__tests__/ReadAloudButton.test.tsx` | Reviewed (15 tests, unverifiable — test infra missing) |
| `mobile/app/(kid)/homework-feedback.tsx` | Reviewed |
| `packages/shared/src/i18n/keys.ts` | Reviewed |
| `mobile/src/i18n/locales/en.json` | Reviewed |
| `mobile/src/i18n/locales/zh-Hans.json` | Reviewed |
| `mobile/__mocks__/expo-speech.ts` | Reviewed |

## ADD Quality Bar Compliance

| Bar | Result | Detail |
|-----|--------|--------|
| Tests pass | UNVERIFIED | Test infra files not on branch |
| Bilingual completeness | PASS | All TTS strings have EN + zh-Hans |
| Accessibility | MINOR | Button label 13pt < 16pt minimum |
| Privacy review | PASS | expo-speech is on-device, no data exfiltration |
| No restricted SDKs | PASS | expo-speech is standard Expo module |
| Branch hygiene | PASS | Feature branch format correct |

## Required Changes

1. **CRITICAL:** Add `Speech.stop()` in `ReadAloudButton` `useEffect` cleanup — speech must stop on component unmount (covers back nav, swipe, tab switch, Android hardware back)
2. **MISSING:** Create this review doc (was listed as deliverable but absent from branch)
3. **MINOR:** Bump button label `fontSize` from 13 to ≥16 for P1-P2 readability, or justify as button-chrome exception
4. **INFRA:** Include test config files (`jest.config.js`, `babel.config.js`, `setup-jest.ts`) for verifiable test runs

## Next Review

Route back to Wolf after fixes. Re-review checks:
- `Speech.stop()` exists in useEffect cleanup
- This review doc committed to `docs/reviews/`
- Test config present, 15 tests pass
