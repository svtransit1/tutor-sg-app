# Review: AAAS-581 M2-84 — HomeworkFeedbackCard

**Reviewer:** Bee (🐝)
**Date:** 2026-05-08
**Branch:** `feat/aaas-581-homework-feedback-card`
**Status:** Ready for Tortoise review

## Changes

### New files

| File | Purpose |
|------|---------|
| `mobile/src/components/HomeworkFeedbackCard.tsx` | Scrollable 3-level hint display card |
| `mobile/src/components/__tests__/HomeworkFeedbackCard.test.tsx` | 16 unit tests |

### Modified files

| File | Change |
|------|--------|
| `mobile/src/i18n/locales/en.json` | Added `homeworkFeedback.*` section (hint/steps/solution/actions) |
| `mobile/src/i18n/locales/zh-Hans.json` | Added `homeworkFeedback.*` section in Simplified Chinese |

## Design

- **3 progressive hint levels** matching ADD §4.1 item 4: Hint (shown first) → Guided Steps (on "Show me more") → Worked Solution (on "Show answer"), with "Show less" to collapse back to hint
- Uses existing `ScaffoldedHelp` and `ScaffoldedHelpTab` types from `@/models/homework-feedback`
- ScrollView body (`maxHeight: 240`, `nestedScrollEnabled`) for long content
- Dark mode via `useColorScheme()`
- Accessibility: `accessibilityRole`, `accessibilityLabel` on card, buttons, and level indicator
- 3-dot progress indicator shows current level
- Optional `questionText` display block, `initialTab` prop for restored state, custom `title` override

## Verification

- **Tests:** 16/16 passed
- **Typecheck:** No type errors in changed files
- **Pre-existing failures:** 0 introduced by this change
