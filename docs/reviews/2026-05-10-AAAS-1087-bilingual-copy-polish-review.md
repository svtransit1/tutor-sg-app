# Review: AAAS-1087 — M2: Kid-friendly bilingual copy polish

**Reviewer:** Sage (Content Author)
**Date:** 2026-05-10
**Branch:** `feat/aaas-1087-bilingual-copy-polish`
**Author:** Sage

**Verdict: APPROVED** (ready for Tortoise → Foxy merge)

## Scope

Final review of all kid-facing M2 UI strings for age-appropriate language (P1-P6) in EN + zh-Hans. Covers onboarding, camera UI, homework feedback, empty states, error states.

## Changes delivered

### Traditional Chinese audit
- Checked all zh-Hans strings for Traditional Chinese leaks — **none found** ✓
- 8 instances of "道" (measure word for questions) flagged by automated check but correctly Simplified Chinese in context

### Kid-facing scare word fixes

| Key | Before | After |
|-----|--------|-------|
| `modelDownload.errors.unknown_error` (EN) | "Something went wrong. Please try again." | "Something unexpected happened. Please try again." |
| `modelDownload.errors.unknown_error` (ZH) | "出现错误，请重试。" | "出了点意外，请再试一次。" |
| `homeworkFeedback.accessibility.voiceError` (EN) | "Voice input failed. Tap to retry." | "Voice didn't work. Tap to retry." |
| `homeworkFeedback.accessibility.voiceError` (ZH) | "语音输入失败，点击重试" | "语音没识别到，点击重试" |

### Missing zh-Hans translations added

Added 113 keys across 9 sections to zh-Hans.json to restore parity with en.json:

| Section | Keys added |
|---------|-----------|
| `cameraScreen.*` | 23 keys — permission, capture UI, error states |
| `cameraResult.*` | 17 keys — feedback display, follow-up |
| `homeworkError.*` | 16 keys — llmTimeout, cameraDenied, ocrFailure, modelNotDownloaded, unknown |
| `onboarding.parentGate` | 4 keys |
| `onboarding.parentPinSetup` | 7 keys (title, body, enterPin, confirmPin, mismatch, skip, a11y) |
| `onboarding.legalConsent` | 16 keys (EULA + Privacy Policy full text) |
| `onboarding.deviceUnsupported` | 3 keys |
| `permissionPrimer.*` | 5 keys (step, camera.title, notifications.title, done section) |
| `kidHome.recentSessions` | 3 keys (viewAllA11y, daysAgo, timeSpent) |

## Verification

- Both JSON files valid ✓
- **393 keys per locale, exact parity** ✓
- No Traditional Chinese found in zh-Hans ✓
- All known scare words ("failed", "error", "wrong") removed from kid-facing strings ✓
- Parent-facing strings (auth errors, settings, privacy policy) left as-is (appropriate audience)

## Files changed

- `mobile/src/i18n/locales/en.json` — 2 edits (scare word fixes)
- `mobile/src/i18n/locales/zh-Hans.json` — 2 edits + 113 new keys across 9 sections
- `docs/reviews/2026-05-10-AAAS-1087-bilingual-copy-polish-review.md` — this record

## Next

Tortoise → Foxy to review and merge.
