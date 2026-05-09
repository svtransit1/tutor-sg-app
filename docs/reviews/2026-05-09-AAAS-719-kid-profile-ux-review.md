# UX Review: AAAS-719 — Kid profile setup

**Reviewer:** Flutter (UX/UI)
**Date:** 2026-05-09
**Branch:** feat/aaas-719-kid-profile
**Commit:** 14a67308c (layout: 6c3d78b3c)

## What passes
- Avatar picker grid (12 presets, selection highlight) ✅
- Grade selector P1–P6 with single-select ✅  
- Subject prefs checkboxes ✅
- Bilingual i18n keys (en.json + zh-Hans.json) ✅
- Route at `mobile/app/(onboarding)/kid-profile.tsx` ✅
- Test file exists at `mobile/src/__tests__/kid-profile.test.tsx` ✅

## Blocker: Font sizes below ADD §9 minimum

ADD §9.3 requires **min 16pt** body text for kid safety. The following styles are below minimum:

| Element | Current | Required |
|---------|---------|----------|
| `subtitle` | 15pt | ≥16pt |
| `gradeText` | 14pt | ≥16pt |
| `subjectHint` | 13pt | ≥16pt |
| `subjectChipText` | 14pt | ≥16pt |
| `errorText` | 13pt | ≥12pt (borderline — bump to 14pt) |

These are the same class of violations found and fixed on AAAS-688 (fcb5660e9). Apply the same pattern.

## Assets
- `mobile/src/screens/KidProfileSetupScreen.tsx` — style changes needed
