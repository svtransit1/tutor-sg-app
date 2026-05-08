Review: READY FOR REVIEW

## AAAS-578 (M0-51) — Fix mobile test failures (VoiceRecorder timing)

**Owner:** Bee (mobile coder #2)  
**Branch:** `feat/aaas-575-button-role`  
**Reviewer needed:** Wolf (mobile coder) or Tortoise (review bot)

### Deliverables

| Artifact | Path |
|---|---|
| Component | `mobile/src/components/VoiceRecorder.tsx` |
| Tests | `mobile/src/components/__tests__/VoiceRecorder.test.tsx` |

### What was built

A standalone `VoiceRecorder` component that manages the full voice-recording lifecycle:

- **State machine:** `idle → recording → processing → error` (with retry → recording)
- **Auto-stop:** configurable `recordingDuration` prop (default: manual stop only)
- **Processing timeout:** configurable `processingDuration` prop (default: 100ms)
- **User interaction:** 🎤 starts recording, ⏹ stops, ⏳ processing, retry after error
- **onStateChange callback:** fired once per state transition (no double-fire)
- **onError callback:** fired on processing timeout
- **Timer cleanup:** all timers cleared on unmount to prevent stale callback issues

### Timing fix

Root cause described in [AAAS-578]: `onStateChange("processing")` was fired twice instead of once due to a race between timer callbacks and React state updates under RN 0.81/React 19.

**Applied fix strategy:** `render + act` pattern with `stateRef.current` guards in timer callbacks. The component uses:
1. `stateRef` to guard against stale timer callbacks modifying state after a transition
2. `clearAllTimers()` on every state exit to prevent overlapping timeouts
3. `callOnStateChange` as a direct synchronous call (not via `useEffect`) so each state transition maps to exactly one callback invocation

This eliminates the double-fire regardless of timer advance strategy — tests confirm both `jest.advanceTimersByTime(3000)` (auto-stop) and manual stop produce exactly one `onStateChange("processing")` call.

### Verification

- **Tests:** 14/14 VoiceRecorder tests passed (14 total test suites, 251/269 total tests — 18 pre-existing SubjectClassifier failures unaffected)
- **Typecheck:** No new type errors (all ~120 pre-existing errors are in other files)
- **Bilingual:** All user-facing strings reference existing `homeworkFeedback.*` i18n keys (EN + zh-Hans)
- **a11y:** `accessibilityRole="button"` on mic/stop/retry buttons, `accessibilityLabel` on all interactive elements
- **Dark mode:** Full dark mode via `useColorScheme()`
- **Double-fire protection verified:** 2 dedicated tests (`manual stop` and `auto-stop` scenarios) assert exactly 1 call to `onStateChange("processing")`

### Pre-existing failures (not introduced)

- `SubjectClassifier.test.ts` — 18 failures (keyword/classification tuning)
- `ManualInputFallbackScreen.test.tsx` — `act()` warnings from draft-restore async effect

### Next actions

1. Wolf or Tortoise to review VoiceRecorder component API and implementation
2. Wire VoiceRecorder into `FollowUpInput` (or replace inline useVoiceState) once reviewed
3. Real audio capture integration (expo-audio or similar) as follow-up to replace simulated timeouts
