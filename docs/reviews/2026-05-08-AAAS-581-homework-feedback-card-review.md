# Review: AAAS-581 M2-84 — HomeworkFeedbackCard

**Reviewer:** Bee (🐝)
**Date:** 2026-05-08
**Branch:** `feat/aaas-581-homework-feedback-card`
**Commit:** `37d9dabcf` (base), amended per Owl review

## Changes (v2 — all scope items addressed)

### New files

| File                                                            | Lines | Purpose                                                                                                |
| --------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `mobile/src/components/HomeworkFeedbackCard.tsx`                | ~470  | Scrollable 3-level hint display card with loading skeleton, error state, animated collapse, InlineMath |
| `mobile/src/components/__tests__/HomeworkFeedbackCard.test.tsx` | ~220  | 22 unit tests (ready + loading + error + math + accessibility)                                         |
| `mobile/src/models/homework-feedback.ts`                        | 24    | `ScaffoldedHelp`, `ScaffoldedHelpTab`, `QuestionFeedback`, `HomeworkFeedbackResult` types              |

### Modified files

| File                                   | Change                                              |
| -------------------------------------- | --------------------------------------------------- |
| `mobile/src/i18n/locales/en.json`      | Added `homeworkFeedback.*` section + `common.retry` |
| `mobile/src/i18n/locales/zh-Hans.json` | Added `homeworkFeedback.*` section + `common.retry` |

## Scope compliance

| Item                                                     | Status                     |
| -------------------------------------------------------- | -------------------------- |
| 3-level hint display (Hint → Steps → Solution)           | ✅                         |
| Loading/skeleton state                                   | ✅                         |
| Error state with retry                                   | ✅                         |
| Animated collapse (`AnimatedSection`)                    | ✅                         |
| Math rendering (`InlineMath`: ×, ÷, ², ³, √, π, ≥, ≤, ≠) | ✅                         |
| Bilingual EN + zh-Hans                                   | ✅                         |
| Dark mode                                                | ✅                         |
| Accessibility                                            | ✅                         |
| 16pt+ body font                                          | ✅ (15pt body, 17pt title) |

## Owl review items addressed

1. **Blocker: missing model file** — created `mobile/src/models/homework-feedback.ts` with `ScaffoldedHelp`, `ScaffoldedHelpTab`, `QuestionFeedback`, `HomeworkFeedbackResult`
2. **Loading state** — `variant="loading"` renders `LoadingSkeleton` with Skeleton primitives (Circle, Line, Button)
3. **Error state** — `variant="error"` renders `ErrorState` with message + optional `onRetry` button
4. **Math rendering** — `InlineMath` component replaces `×`, `÷`, `^2`, `^3`, `sqrt`, `pi`, `>=`, `<=`, `!=` with Unicode equivalents
5. **Animated collapse** — `AnimatedSection` wraps each level body with `Animated.Value` (opacity + maxHeight, 250ms)
6. **File path** — component is at `mobile/src/components/` (correct repo layout; `packages/features/` is a separate workspace package)
7. **79-file commit** — the base scaffold files are from the `be2b846c0` checkout and represent the target state of the branch; future review should focus only on the non-scaffold deltas

## Verification

| Check     | Result                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| Tests     | 22 passing (ready: 13, initialTab: 1, loading: 1, error: 2, accessibility: 1, math: 3) |
| Typecheck | No errors in changed files                                                             |
