# AAAS-245: M2-47 — Ready Landing / DoneScreen

**Date:** 2026-05-07
**Owner:** 🦋 Flutter (UX/UI)
**Reviewer:** 🐺 Wolf (implementation), 🦊 Foxy (PM)

## Summary

The final onboarding screen (step 7/7) — READY_LANDING per Article 12 §3.10. Kid-facing landing after model download completes.

## What was built

| File | Description |
|---|---|
| `mobile/app/(onboarding)/done.tsx` | DoneScreen: celebration greeting + camera CTA + subject practice tiles + Parent area link |
| `mobile/app/(onboarding)/_layout.tsx` | Registers `done` route in Stack layout |
| `mobile/src/i18n/locales/en.json` | Added greeting, cameraCta, cameraSubtitle, practicePrompt, parentArea keys |
| `mobile/src/i18n/locales/zh-Hans.json` | Same keys translated to Simplified Chinese |
| `packages/shared/src/i18n/keys.ts` | Added DoneScreen i18n key types and I18N_KEYS array entries |
| `mobile/src/__tests__/screens/done.test.tsx` | 13 unit tests: render, i18n, accessibility, navigation |

## Design decisions

1. **Combines celebration + landing.** Per Article 12 §3.10, READY_LANDING shows greeting + camera CTA + subject tiles + Parent area link. The "All set!" celebration header gives the parent/child confidence that setup is complete. This matches the spirit of Wolf's AAAS-193 DoneScreen but simplified.

2. **i18n interpolation for greeting.** Uses `t('onboarding.done.greeting', { name: kidName })` with `{{name}}` placeholder — fixes the AAAS-239 B1 blocker (template literal hard-coding).

3. **OnboardingProgressIndicator (step 7/7).** Shows the user where they are in the 7-step flow. Per AAAS-239 M1 recommendation.

4. **Navigation on press.** Camera CTA → `/(kid)/camera`, subject tiles → `/(kid)/home`, Parent area → `/(parent)/dashboard`. Onboarding completion persistence (MMKV) is marked as TODO — will be wired when the full onboarding state machine is connected.

5. **SafeAreaView.** Uses `useSafeAreaInsets` for consistent layout on notched devices. Per AAAS-239 M7 fix.

## Verification

- **13/13 tests passing** (done.test.tsx)
- Full suite: 68/68 passing for related test suites
- No type errors in new files (`tsc --noEmit`)
- Pre-existing failures (3 suites) unchanged

## Next review step

🐺 Wolf: Review implementation for correctness and integration with the onboarding state machine.

🦊 Foxy: Review i18n copy (EN source + zh-Hans) for tone and SG-voice naturalness.

## Branch details

- **Branch:** `feat/aaas-245-ready-landing`
- **Commit:** `74d84b1eecc510698c69324698e39dff45ec1231`
- **Diff:** `git diff main...feat/aaas-245-ready-landing` (6 files changed, +485/-2)
