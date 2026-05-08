# AAAS-538 Review — On-device TTS playback for homework feedback

**Date:** 2026-05-08  
**Reviewer:** Tortoise  
**Branch:** `feat/aaas-540-homework-session-persistence` @ `454ee8ad9`  
**Verdict:** APPROVED (re-review)

## Acceptance Criteria Matrix (re-review)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | "Listen" button on feedback screen plays feedback via TTS | PASS |
| 2 | Correct language voice (EN vs zh-Hans) | PASS |
| 3 | Stops when navigating away | PASS (fixed — `Speech.stop()` in cleanup) |
| 4 | Works offline (airplane mode) | PASS |

## Files Reviewed (final)

| File | Status |
|------|--------|
| `mobile/src/components/ReadAloudButton.tsx` | Reviewed |
| `mobile/src/components/__tests__/ReadAloudButton.test.tsx` | Reviewed (17 tests, all pass) |
| `mobile/app/(kid)/homework-feedback.tsx` | Reviewed |
| `packages/shared/src/i18n/keys.ts` | Reviewed |
| `mobile/src/i18n/locales/en.json` | Reviewed |
| `mobile/src/i18n/locales/zh-Hans.json` | Reviewed |
| `mobile/__mocks__/expo-speech.ts` | Reviewed |
| `mobile/jest.config.js` | Reviewed (react-native preset added) |
| `mobile/setup-jest.ts` | Reviewed (deconflicted mocks) |
| `mobile/babel.config.js` | Reviewed |

## ADD Quality Bar Compliance (final)

| Bar | Result | Detail |
|-----|--------|--------|
| Tests pass | PASS | 41 tests, 3 suites, all green |
| Bilingual completeness | PASS | All TTS strings have EN + zh-Hans |
| Accessibility | PASS | Button label 16pt |
| Privacy review | PASS | expo-speech is on-device, no data exfiltration |
| No restricted SDKs | PASS | expo-speech is standard Expo module |
| Branch hygiene | PASS | Feature branch, review doc committed |

## Re-review Fixes Verified

| # | Fix | Location | Verdict |
|---|------|----------|---------|
| 1 | `Speech.stop()` in useEffect cleanup | `ReadAloudButton.tsx:52,69` | PASS |
| 2 | Review doc committed | `docs/reviews/2026-05-08-AAAS-538-tts-homework-feedback.md` | PASS |
| 3 | Font size 13→16pt | `ReadAloudButton.tsx:185,189` | PASS |
| 4 | Test config + unmount tests | `jest.config.js`, `setup-jest.ts`, `babel.config.js` | PASS |
| 5 | Test infra fixes (Tortoise) | jest.config.js (react-native preset), act() wrapping, i18n mock stubs | PASS |

## Commits

- `3ffb6cae9` — Wolf: Speech.stop(), fontSize 16, test config, review doc
- `454ee8ad9` — Tortoise: jest react-native preset, act() wrapping, i18n mocks
