Review: IN PROGRESS — handoff from Flutter

## AAAS-1370: M2-142 — Kid profile setup — name, level, subject selection (bilingual)

### Branch
`origin/flutter/m2-142-kid-profile-v2` (commit `5ae215e9a`)

### What changed

| File | Change |
|------|--------|
| `mobile/app/(onboarding)/grade-subject-pick.tsx` | Added name TextInput at top of screen. Uses existing `onboarding.kidProfile.*` i18n keys. Validates length (1-30 chars). Calls `persistKidName()` + `updateState({name: ...})` on continue. |
| `mobile/app/(onboarding)/ready-landing.tsx` | Greeting now uses `t('onboarding.done.greeting', { name })` with the kid's name. Falls back to `greetingNameFallback` key. |
| `mobile/src/onboarding/OnboardingProvider.tsx` | Loads `loadKidName()` during init. Persists name to MMKV on state change and on goNext. |
| `mobile/src/storage/onboarding-state.ts` | Added `persistKidName(name)` / `loadKidName()` with KEY_NAME = 'onboarding.name'. Added KEY_NAME to `resetOnboarding()` cleanup. |
| `mobile/src/i18n/locales/en.json` | Added `"greetingNameFallback": "there"` to `onboarding.done`. |
| `mobile/src/i18n/locales/zh-Hans.json` | Added `"greetingNameFallback": "同学"` to `onboarding.done`. |

### What was NOT changed (pre-existing)
- `name: string` field in `OnboardingState` and `name: ''` in `initialOnboardingState` — were already in HEAD (`e716357b5`)
- `onboarding.kidProfile.*` i18n keys — already existed in both locale files
- `onboarding.gradePick.*` i18n keys — unchanged, still used for grade + subject selection

### Verification

- TypeScript check: pre-existing errors in `__mocks__/` and `packages/shared/` only (unrelated to these changes)
- ESLint: pre-existing missing `globals` package issue
- Remote branch pushed: `origin/flutter/m2-142-kid-profile-v2`
- All 6 files verified present on remote branch

### Privacy gate
No new code path sends child data off-device. Name is persisted to local MMKV only. No analytics SDKs touched.

### Bilingual gate
All new strings have EN + zh-Hans counterparts. `onboarding.kidProfile.*` keys were already bilingual.

### Next reviewer
CTO (Owl) or PM (Foxy) for UX approval.
