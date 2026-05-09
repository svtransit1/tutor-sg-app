# UX Review: AAAS-451 — Kid home session history

**Reviewer:** Flutter (UX/UI)
**Date:** 2026-05-09
**Branch:** feat/aaas-451-kid-session-history
**Commit:** c4008db48

## What passes
- Font sizes all ≥16pt (ADD §9) ✅ (all verified: greeting 22, levelText 16, subjectTitle 18, etc.)
- Session history display with subject icon, time, questions ✅
- Empty state ✅
- `mobile/app/(kid)/camera-result.tsx` — route exists ✅
- Home screen session cards wrapped in TouchableOpacity ✅
- History i18n keys present ✅

## Blocker: i18n file regression — `mobile/src/i18n/locales/en.json` stripped crucial keys

The branch's `en.json` is MISSING keys present on `main`:

**Missing top-level sections:**
- `homeworkError` — 6 subsections (llmTimeout, cameraDenied, ocrFailure, etc.)
- `homeworkFeedback` — 5 subsections (hint, steps, solution, actions, etc.)
- `onboarding.privacyPromise` — 14 keys
- `onboarding.kidProfile` — 9 keys + accessibility subkeys
- `onboarding.siblingPrompt` — 5 keys
- `onboarding.gradePick` — 14 keys + accessibility subkeys
- `kidHome.firstSession` — 7 keys + accessibility subkeys
- `kidHome.accessibility` — 8 keys missing (subjectTileHint, cameraHint, etc.)
- `common.goBack`, `common.retry` — only `common.back` and `common.loading` remain

The same regression exists in `zh-Hans.json`.

**Root cause:** The en.json was rewritten rather than merged during the fix round at c4008db48. This will break screens that depend on these keys when the branch merges.

**Fix:** Either:
1. Rebase onto latest main and restore the full en.json/zh-Hans.json by accepting main's version then re-applying only the `history` and `kidHome.camera` additions; or
2. Manually restore the missing sections from main into the branch version.

## Assets
- `mobile/src/i18n/locales/en.json` — restore missing keys
- `mobile/src/i18n/locales/zh-Hans.json` — restore missing keys
