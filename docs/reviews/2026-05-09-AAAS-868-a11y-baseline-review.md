# AAAS-868: M2 Accessibility Baseline Review

**Date:** 2026-05-09
**Reviewer:** Parrot (QA)
**Branch:** `feat/aaas-868-a11y-onboarding-homework` (HEAD: `9792e6f9d`)

## Review: CHANGES REQUESTED

## Code review

7 files changed, 165 insertions. Accessibility labels added to:

| Screen | Labels added | Quality |
|---|---|---|
| KidHome (`app/(kid)/home.tsx`) | `accessibilityLabel`, `accessibilityRole="header"`, `accessibilityHint` | Good |
| ParentDashboard (`app/(parent)/index.tsx`) | `accessibilityLabel`, `accessibilityRole="header"` | Good |
| ParentPinSetup (`ParentPinSetupScreen.tsx`) | Success view, main view, back/cancel/skip buttons | Good |
| PinGate (`PinGateScreen.tsx`) | Dismiss, icon, title, body, cancel button | Good |
| app/index.tsx | Labels for entry screen | Good |

### i18n coverage
- `en.json`: 62 lines added — all a11y keys present
- `zh-Hans.json`: 62 lines added — all a11y keys present, proper Simplified Chinese
- Bilingual requirement met per ADD §9.2

### What's good
- All interactive elements have `accessibilityRole` and `accessibilityLabel`
- Error states use `accessibilityRole="alert"`
- Icons use `accessibilityRole="image"` with descriptive labels
- Hint text provided for complex interactions (e.g., "Opens {{subject}} practice questions")

## Issues found

1. **Branch is stale:** Based on commit `f24acd7f0` (AAAS-581), while main HEAD is `0fab34948` (AAAS-779). Must rebase on latest main.

2. **Missing screens:** The following M2 screens have no a11y labels in this branch:
   - Camera capture screen (`app/(kid)/camera.tsx`) — `cameraScreen.accessibility` keys exist in i18n but code not present on branch
   - Camera result screen (`app/(kid)/camera-result.tsx`) — no a11y labels
   - Homework feedback card (`HomeworkFeedbackCard.tsx`) — `homeworkFeedback.accessibility` keys exist but component not annotated

3. **No verification evidence:** Per ADD §9.8, must attach build output, smoke test, or screenshot. None provided.

4. **Font size not verified:** ADD §9.3 requires min 16pt body font. No evidence of font size audit.

5. **Contrast ratio not verified:** ADD §9.3 requires high contrast / WCAG AA. No evidence of contrast audit.

6. **Typecheck fails on branch:** Same 4 errors as main (pre-existing).

## Required fixes

1. Rebase on latest `main`
2. Add a11y labels to CameraScreen, CameraResultScreen, HomeworkFeedbackCard
3. Document font sizes (min 16pt) and contrast ratios per screen
4. Provide build verification evidence
5. Add per-screen audit table with pass/fail/note per ADD §9.3

## Route to

Owner: Parrot — this branch was authored by Parrot. Rebase and complete coverage.
