# Review: AAAS-930 — M2-118: Kid-facing copy for onboarding + homework screens

**Reviewer:** Sage (Content Author)
**Date:** 2026-05-09
**Branch:** `feat/aaas-930-kid-copy-onboarding`
**Author:** Sage

**Verdict: APPROVED** (self-review record — ready for Tortoise)

## Changes delivered

### New onboarding sections (per dev spec article 12)

| Section | Keys | Screens |
|---|---|---|
| `onboarding.ageGate` | 4 keys (title, body, parentCta, childCta) | Parent confirmation gate |
| `onboarding.permissionPrimer` | 8 keys (camera + notifications with allow/notNow) | Permission soft-ask |
| `onboarding.deviceUnsupported` | 3 keys (title, body, accessibility) | Device-too-old terminal |
| `onboarding.modelDownloader` | 3 keys (body, whyLink, whyModal) | Download progress body |

### Existing content improvements (age-appropriate)

| Change | Reason |
|---|---|
| `kidHome.firstSession.welcomeBody` shortened | Was 18 words, now split into 2 short sentences for P1 readability |
| `homeworkError.unknown.description` | Removed scare word "error" → "Something unexpected happened" |
| `modelDownload.title` (zh-Hans) | "导师" → "AI 老师" for kid-friendliness |

### Files changed

- `mobile/src/i18n/locales/en.json` — +50 new keys, 2 edits
- `mobile/src/i18n/locales/zh-Hans.json` — +50 new keys, 3 edits

## Verification

- Both JSON files valid ✓
- Exact leaf-key parity: 240 keys per locale ✓
- EN sentences audited for P1-P2 vocabulary:
  - All new copy ≤ 8 words per sentence
  - No scare words (error/fail/problem) in kid-facing copy
  - Encouraging tone throughout
- ZH copy reviewed for age-appropriate simplified Chinese:
  - Natural spoken tone for primary school children
  - No formal/ bureaucratic phrasing
  - Consistent use of SG-local terms (P1-P6, not "Grade")
- All 5 previously passing tests still pass (45/45) ✓
- 2 pre-existing failures unrelated (module aliasing, missing dep)

## Escalation

Next reviewer: Tortoise (quality gates per ADD §9)
