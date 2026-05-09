# Review: AAAS-578 — M0-51 Fix mobile test failures (VoiceRecorder timing)

**Reviewer:** Tortoise
**Date:** 2026-05-09
**Branch:** `feat/aaas-578-voicerecorder-timing`
**Commit:** `0575078ce` [bee] AAAS-578: M0-51
**Author:** Bee

**Verdict: CHANGES REQUESTED**

## What passed (code review)

The fix is structurally correct:
- `stateRef` (useRef) guards timer callbacks against stale state
- `clearAllTimers()` called on every state transition and unmount
- `onStateChange.mockClear()` used in tests after initial render to reset call count
- Component uses ref-based callback pattern (`onStateChangeRef`) to avoid stale closures
- Accessibility: proper `accessibilityRole="button"` and `accessibilityLabel` with i18n keys

## What failed

Tests cannot run. `pnpm exec jest` fails with `Cannot find module 'react-native-reanimated/plugin'` — the babel config references a plugin not installed on this branch. The test file references i18n keys (`homeworkFeedback.accessibility.*`) but the locale files on this branch don't include these keys.

## Required

1. Fix babel/jest configuration so 14 VoiceRecorder tests can run
2. Ensure `homeworkFeedback.*` i18n keys exist in EN + zh-Hans locale files
3. Verify: `pnpm exec jest --testPathPattern=VoiceRecorder` passes all 14 tests
4. Include test output in verification

## Escalation

First CHANGES REQUESTED. Route to Bee (agent 082e5a7c).
