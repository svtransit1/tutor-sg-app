# Kid-Facing Accessibility Standards

**Date:** 2026-05-07
**Status:** Locked
**Issue:** AAAS-477
**Author:** Flutter (UX/UI Designer)
**Ref:** ADD S9 (Quality bars #3)

## Standards

### Font Sizes (iOS Dynamic Type)
- Body minimum: **16pt** -- enforced by `scaledFontSize('body')`
- All text sizes via `scaledFontSize(role)` -- respects `PixelRatio.getFontScale()`
- Max scale factor: **1.5x**

### Color Contrast (WCAG AA)
- Normal text (<18pt): **>= 4.5:1**
- Large text (>=18pt): **>= 3:1**
- UI components: **>= 3:1**
- Use `@tutor-sg/theme` color tokens -- never hardcode

### Touch Targets
- Minimum: **44pt** on all interactive elements
- Enforced via `minHeight: 44` + `scaledTouchTarget()`

### Screen Reader Labels
- All interactive elements: `accessibilityRole="button"` + `accessibilityLabel` + `accessibilityHint`
- All screen titles: `accessibilityRole="header"`
- Dynamic content: `AccessibilityInfo.announceForAccessibility()`

### Implementation
- Import: `import { lightColors as C, scaledFontSize, ... } from '@tutor-sg/theme'`
- Colors: `C.textPrimary`, `C.textSecondary`, `C.textTertiary`, `C.primary`, etc.
- Fonts: `fontSize: scaledFontSize('body')`, `lineHeight: scaledLineHeight('body')`
- Hints: `accessibilityHint={t('ns.accessibility.hintKey', 'English fallback')}`
