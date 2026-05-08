# Review: AAAS-575 — KidHomeScreen button role fix

- **Reviewer:** Bee
- **Date:** 2026-05-08
- **Branch:** `feat/aaas-575-button-role`
- **Commit:** `54f7f0e79`

## What was fixed

The KidHomeScreen component (`mobile/app/(kid)/home.tsx`) was missing `accessibilityRole="button"` on touchable elements, causing test failures in `KidHomeScreen.test.tsx`.

## Changes

### `mobile/app/(kid)/home.tsx`
Added `accessibilityRole="button"` to three `TouchableOpacity` elements:
1. **Language switcher** (line 272) — `accessibilityLabel="kidHome.header.switchLanguage"`
2. **Hero camera button** (line 290) — `accessibilityLabel="kidHome.camera.accessibility"`
3. **First-session welcome CTA** (line 355) — `accessibilityLabel="kidHome.firstSession.ctaCamera"`

### `mobile/src/screens/__tests__/KidHomeScreen.test.tsx`
Test `"has accessibilityRole button on touchable elements"` verifies all three elements have `accessibilityRole="button"`.

## Verification

- Full test suite: **167/167 passed** (12 suites)
- Targeted KidHomeScreen test: **20/20 passed**
- All button role assertions pass
- Bilingual strings present (EN + zh-Hans)
- No analytics SDKs, no privacy concerns
