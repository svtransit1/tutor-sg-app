---
title: "Review: AAAS-250 M2-49 — LANG_PICK screen (onboarding step 1/7)"
date: 2026-05-07
reviewer: Tortoise
status: changes-requested
---

# Review: AAAS-250 — LANG_PICK Screen

## Scope

LANG_PICK screen per onboarding dev spec §3.2 ([articles/12-first-90s-onboarding-dev-spec.md]).

## Implementation Reviewed

- **Branch:** `feat/aaas-233-kid-home-empty-state`
- **Commit:** `9707d2c` — `[flutter] AAAS-250: Add LANG_PICK screen — onboarding step 1/7`
- **Files:**
  - `mobile/app/(onboarding)/lang-pick.tsx` (new, +457 lines)
  - `mobile/src/screens/__tests__/LangPickScreen.test.tsx` (new, 25 tests)
  - `mobile/src/i18n/locales/en.json` (added `onboarding.langPick.continue`)
  - `mobile/src/i18n/locales/zh-Hans.json` (added `onboarding.langPick.continue`)
  - `mobile/__mocks__/react-native.ts` (added `Pressable` export)

## Verification

- ✅ 25/25 LangPickScreen tests pass
- ✅ 116/116 full test suite passes (9 suites)

## Findings

### 5 Spec Deviations (CHANGES REQUESTED)

#### 1. Navigation target — `welcome` instead of `age-gate`
- **Spec:** LANG_PICK → AGE_GATE (dev spec §2 state machine)
- **Implementation:** `router.replace('/(onboarding)/welcome')`
- **Fix:** Change to `/(onboarding)/age-gate` (exists at commit 8ca6287, AAAS-251)

#### 2. "No next button" spec violation
- **Spec:** "No 'next' button — tap = commit" (§3.2)
- **Implementation:** Has a selection state + Continue button; tap does not commit directly
- **Fix:** Tap language card → immediately persist + switch i18n + navigate. Remove Continue button and selection-intermediate state.

#### 3. Large-text reflow missing
- **Spec:** "if accessibility large-text is on, tiles must reflow to vertical stack, no copy clipping" (§3.2 edge)
- **Implementation:** Fixed `flexDirection: 'row'` layout, no large-text detection
- **Fix:** Use `PixelRatio.getFontScale()` or `AccessibilityInfo` to detect large-text and switch to `flexDirection: 'column'` with full-width cards

#### 4. Bilingual card labels don't adapt to current locale
- **Spec:** Tiles show different labels depending on current locale:
  - EN mode: Left="English", Right="中文 (简体)"
  - zh-Hans mode: Left="英文", Right="中文（简体）"
- **Implementation:** Hardcoded labels (English card always "English", Chinese card always "中文" + "简体中文" subtext)
- **Fix:** Read `i18n.language` and show locale-appropriate labels from i18n keys

#### 5. Chinese tile copy format
- **Spec:** Right tile EN copy is "中文 (简体)" — one string
- **Implementation:** Split into "中文" (label) + "简体中文" (subtext)
- **Fix:** Unify to one label per spec

### What Passed

- Persistence (`persistLocale` → MMKV) works correctly for both locales
- `i18n.changeLanguage()` fires on continue
- Accessibility labels present on both cards (`accessibilityRole="button"`, `accessibilityState.selected`)
- Progress dots render with correct step count
- Dark mode styling applies
- Both EN and zh-Hans locale files include the screen's keys
- Test coverage is thorough (rendering, selection, persistence, navigation, accessibility)

## Next Action

Route to Flutter (original implementer) to fix the 5 spec deviations.
