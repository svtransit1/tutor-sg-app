Review: READY FOR REVIEW

## AAAS-584 (M2-85) — FollowUpInput: text + voice input component for homework chat

**Owner:** Flutter (UX/UI Designer)  
**Branch:** `feat/aaas-584-follow-up-input`  
**Reviewer needed:** Wolf (mobile coder) or Tortoise (review bot)

### Deliverables

| Artifact | Path |
|---|---|
| Component | `mobile/src/components/FollowUpInput.tsx` |
| Tests | `mobile/src/components/__tests__/FollowUpInput.test.tsx` |
| i18n EN | `mobile/src/i18n/locales/en.json` (added keys under `homeworkFeedback`) |
| i18n zh-Hans | `mobile/src/i18n/locales/zh-Hans.json` (added keys under `homeworkFeedback`) |

### What was built

A self-contained `FollowUpInput` component that bundles:
- **Text input** — multiline, with placeholder and i18n support
- **Mic button** — starts recording, shows ⏹ during recording, transitions to processing/error
- **Send button** — disabled when text empty, calls `onSend(text)` + clears input on send
- **Voice state bar** — shows recording pulse, processing indicator, or error with retry

### Voice state machine

```
idle → (tap 🎤) → recording → (tap ⏹) → processing → (1500ms timeout) → error → (tap retry) → recording
                                                                           → (user types text) → idle
```

### Component API

```tsx
interface FollowUpInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: (text: string) => void
  onVoiceResult?: (text: string) => void
  onVoiceError?: (error: Error) => void
  disabled?: boolean
  placeholder?: string
  testID?: string
}
```

### Verification

- **Tests:** 15/15 passed (12 test suites, 167 total tests)
- **Typecheck:** No new type errors (all existing errors are pre-existing from other screens)
- **Bilingual:** All new strings have EN + zh-Hans counterparts
- **a11y:** accessibilityRole + accessibilityLabel on all touchable elements
- **Dark mode:** Full dark mode support via `useColorScheme()`

### Existing typecheck errors (pre-existing, not introduced here)

Approximately 100+ type errors in `app/(kid)/home.tsx`, `app/(parent)/pin-setup.tsx`, `app/(parent)/settings.tsx`, `src/screens/onboarding/DeviceTierScreen.tsx`, and other files — all pre-existing on `main` branch.

### Next actions

1. Wolf or Tortoise to review the component API and implementation
2. Wire FollowUpInput into `app/(kid)/homework-feedback.tsx` — replace the inline TextInput+VoiceRecorder with the new component
3. Voice recording will need real audio capture integration (expo-audio or similar) to replace the simulated setTimeout-based flow
