# M2 Kid-Facing Accessibility Audit

**Issue:** AAAS-477
**Date:** 2026-05-08
**Author:** Flutter (UX/UI Designer)
**Ref:** ADD §9 (Quality bars #3), WCAG AA
**Status:** Baseline audit — branch `feat/aaas-477-kid-accessibility-final`

## Standards Applied

| Requirement | WCAG SC | Threshold |
|---|---|---|
| Body text minimum | 1.4.4 | >= 16pt dynamic |
| Normal text contrast | 1.4.3 | >= 4.5:1 |
| Large text contrast (>=18pt) | 1.4.3 | >= 3:1 |
| Touch targets | 2.5.5 | >= 44pt (iOS) / >= 48dp (Android) |
| Screen reader labels | 4.1.2 | `accessibilityRole` + `accessibilityLabel` + `accessibilityHint` |
| Icon + text labels | -- | Every icon must have visible text label |

## Current Status

| Screen | File | Exists | Passes Audit | Notes |
|---|---|---|---|---|
| Kid Layout | `mobile/app/(kid)/_layout.tsx` | ✅ New | ✅ | `KidScreenHeader` with `accessibilityRole="header"` |
| Error Boundary | `mobile/src/components/ErrorBoundary.tsx` | ✅ Fixed | ✅ | Colors tokenized, fonts >=16pt, touch targets >=44pt |
| AccessiblePressable | `mobile/src/components/AccessiblePressable.tsx` | ✅ New | ✅ | Reusable a11y-first button component |
| Theme tokens | `packages/theme/src/tokens/colors.ts` | ✅ Fixed | ✅ | `disabledText` light: `#6B7280` (4.6:1) |
| Kid Home | -- | ❌ Pending | -- | Build on `feat/aaas-141-kid-home` |
| Manual Input | -- | ❌ Pending | -- | Build on `feat/aaas-131-manual-input-fallback` |
| Camera | -- | ❌ Pending | -- | Build on `feat/aaas-304-camera-permissions` |
| Permission Primer | -- | ❌ Pending | -- | Build on `feat/aaas-304-camera-permissions` |
| Language Pick | -- | ❌ Pending | -- | Build on `feat/aaas-250-lang-pick` |
| Kid Profile | -- | ❌ Pending | -- | Build on `feat/aaas-474-kid-profile-screen` |
| Device Tier | -- | ❌ Pending | -- | Build on `feat/aaas-242-device-tier-screen` |
| Privacy Promise | -- | ❌ Pending | -- | Build on `feat/aaas-158-error-states` |

## Violations Fixed This Pass

### 1. `mobile/src/components/ErrorBoundary.tsx`

| Issue | Before | After |
|---|---|---|
| Font size < 16pt | `errorDesc: 15`, `secondaryButtonText: 15`, `textLinkLabel: 14` | All >=16 via `MIN_BODY_SIZE` |
| Hardcoded colors | 7 `isDark ? ...` ternaries with raw hex | Single `COLORS` map, all refs use `C.*` |
| Touch target < 44pt | `textLink: paddingVertical: 8` | `minHeight: 44` |
| Touch target < 44pt | `secondaryButton: paddingVertical: 12` | `minHeight: 44` |

### 2. `mobile/app/(kid)/_layout.tsx`

| Issue | Before | After |
|---|---|---|
| No header roles | No `accessibilityRole` | `accessibilityRole="header"` on screen header |

### 3. `packages/theme/src/tokens/colors.ts`

| Token | Before | Contrast | After | Contrast |
|---|---|---|---|---|
| `disabledText` light | `#9CA3AF` | 2.9:1 FAIL | `#6B7280` | 4.6:1 PASS |

### 4. `mobile/src/components/AccessiblePressable.tsx`

New reusable component with:
- `minHeight: 44` touch target
- `accessibilityRole="button"` + `accessibilityLabel` + `accessibilityHint`
- 3 variants: `primary`, `secondary`, `text`
- Dark mode aware, font size >= 16pt, disabled state

## Pattern Guide for New Screens

Every new M2 kid-facing screen MUST:
- All body text >= 16pt via `MIN_BODY_SIZE`
- All colors from `COLORS` map or `@tutor-sg/theme`
- Every interactive element has `accessibilityRole` + `accessibilityLabel` + `hint`
- Every icon has text label
- Every touch target `minHeight: 44`
- Dark mode tested

## Cross-References

- Theme tokens: `packages/theme/src/tokens/colors.ts`
- Font scale: `packages/theme/src/utils/fontScale.ts`
- Typography: `packages/theme/src/tokens/typography.ts`
- Decision doc: `docs/decisions/2026-05-07-kid-accessibility-standards.md`
- AccessiblePressable: `mobile/src/components/AccessiblePressable.tsx`
- Error boundary: `mobile/src/components/ErrorBoundary.tsx`
- Kid layout: `mobile/app/(kid)/_layout.tsx`
