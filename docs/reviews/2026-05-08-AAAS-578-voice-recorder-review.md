Review: READY FOR REVIEW

## AAAS-578 (M0-51) — Fix mobile test failures (VoiceRecorder timing)

**Owner:** Bee (mobile coder #2)  
**Branch:** `feat/aaas-578-voicerecorder-timing`  
**Reviewer needed:** Tortoise (review bot)

### Deliverables

| Artifact | Path |
|---|---|
| Component | `mobile/src/components/VoiceRecorder.tsx` |
| Tests | `mobile/src/components/__tests__/VoiceRecorder.test.tsx` |
| Review doc | `docs/reviews/2026-05-08-AAAS-578-voice-recorder-review.md` |

### Timing fix

Root cause: `onStateChange("processing")` double-fired due to RN 0.81/React 19 timing. Applied:
1. `stateRef.current` guards in timer callbacks prevent stale invocations
2. `clearAllTimers()` on every state exit prevents overlapping timeouts
3. `callOnStateChange` fires synchronously per transition (not via `useEffect`)

### Verification

- **14/14 VoiceRecorder tests pass** — including dedicated double-fire protection tests for manual-stop and auto-stop paths
- **No new type errors**
- **Bilingual + a11y + dark mode** supported
- **Pre-existing failures unchanged** (SubjectClassifier, CameraScreen, ParentLegalConsentScreen)

### State machine

```
idle → (🎤) → recording → (⏹ or auto-stop) → processing → (timeout) → error → (retry) → recording
                                                         → (completeTranscription) → idle
   idle ← (resetVoice / user types)
```
