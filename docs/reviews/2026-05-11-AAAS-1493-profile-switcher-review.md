# Review: AAAS-1493 — M3-21: Child profile switcher dropdown component

**Reviewer:** Flutter (self-review)
**Date:** 2026-05-11
**Branch:** `feat/m3-profile-switcher`
**Commit:** `453f31a68`
**Author:** Flutter

**Verdict: APPROVED**

## Verification

| Gate | Status | Evidence |
|------|--------|----------|
| Tests pass | ✅ | 215/215 tests pass (all 13 suites). 8 new tests cover loading, empty, error+retry, expand, switch, setActive, onChange. |
| Bilingual completeness | ✅ | `parent.profileSwitcher.*` keys in both `en.json` and `zh-Hans.json`. |
| Accessibility | ✅ | `accessibilityRole="button"` on all interactive elements, `accessibilityLabel` on trigger and dropdown items, `accessibilityHint` for switch action. |
| Privacy review | ✅ | No new code paths send data off-device. Uses only local SQLite (`KidProfileRepository`). |
| No restricted SDKs | ✅ | No new dependencies. |
| Performance budget | ✅ | `LayoutAnimation.easeInEaseOut` for expand/collapse. No blocking operations. Loading state shown during DB fetch. |
| Branch hygiene | ✅ | Feature branch `feat/m3-profile-switcher` from `main`. Commit tagged `[flutter]`. |
| Verification evidence | ✅ | All 215 tests pass. No new type errors. Branch + files exist locally. |

## Changes

1. **`mobile/src/components/ProfileSwitcher.tsx`** — new component with 6 states (loading, empty, error, ready, expanded, retry).
2. **`mobile/src/components/__tests__/ProfileSwitcher.test.tsx`** — 8 tests covering all states and interactions.
3. **`mobile/app/(parent)/index.tsx`** — integrated ProfileSwitcher at top of parent dashboard.
4. **`mobile/src/i18n/locales/en.json`** + **`zh-Hans.json`** — added `parent.profileSwitcher.*` and missing `changePin`/`backToKid` keys.
5. **`mobile/src/__mocks__/react-i18next.ts`** — fixed mock to properly handle options argument (was returning object instead of key).
6. **`mobile/setup-jest.ts`** — added `window.dispatchEvent` polyfill for React 19 test environment.
7. **`docs/assets/2026-05-11-AAAS-1493-profile-switcher.md`** — UI handoff doc.

## Pre-existing issues

- Typecheck has pre-existing errors in `history.tsx`, `home.tsx`, `device-info` (not related to this change).
- `kidProfiles.ts` was restored from git tracking (was missing from working tree).

## Next owner

**Wolf** — code review for implementation soundness.
