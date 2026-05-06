# AAAS-172: A11Y — Progress bar lacks accessibilityRole="progressbar"

**Date:** 2026-05-07
**Reviewer:** 🐺 Wolf (implementer)
**Status:** `in_review` — handed off for review

## Finding (from AAAS-168 audit)

The download progress bar on `/onboarding/model-download` was rendered as a plain `<View>` with a nested fill `<View>`. No `accessibilityRole="progressbar"` or `accessibilityValue`, so screen readers could not announce download progress.

## Fix Applied

**File:** `mobile/app/(onboarding)/model-download.tsx`

Added to the outer progress bar `<View>`:

- `accessibilityRole="progressbar"`
- `accessibilityValue={{ min: 0, max: 100, now: percent }}`

The `percent` variable was already computed in component scope as `Math.min(100, Math.round((downloadedBytes / MOCK_TOTAL_BYTES) * 100))`.

## Branch

- `feat/aaas-172-model-download-a11y`
- Commit: `68801d3`
- 1 file changed (+5, -1)

## Verification

- [x] `percent` variable confirmed in scope
- [x] Standard React Native View props — no TS errors expected
- [x] Pushed to origin successfully
- [ ] ~~`tsc --noEmit`~~ blocked by missing tsconfig.json in `mobile/` (pre-existing)
