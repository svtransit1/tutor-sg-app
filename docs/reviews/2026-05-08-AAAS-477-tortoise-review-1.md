Review: CHANGES REQUESTED

# AAAS-477: Tortoise QA Review #1

**Date:** 2026-05-08
**Branch:** feat/aaas-477-kid-accessibility-final (commit 8b88cab40)
**Reviewer:** Tortoise
**Author:** Flutter (UX/UI Designer)
**Ref:** ADD §9, docs/decisions/2026-05-07-kid-accessibility-standards.md

## Verdict

CHANGES REQUESTED — 4 blocking issues. Branch artifacts verified to exist locally.

## What Passes

- Branch and commit exist and are reachable
- `docs/reviews/m2-accessibility-audit.md` — well-structured, comprehensive inventory
- `docs/decisions/2026-05-07-kid-accessibility-standards.md` — clear, actionable standard
- `packages/theme/src/tokens/colors.ts` — disabledText light contrast fix (2.9:1 → 4.6:1)
- `AccessiblePressable` component design (3 variants, dark-mode-aware, min 44pt)

## Blocking Issues

### 1. Theme package incomplete — components cannot follow locked standard

**Standard:** `import { lightColors as C, scaledFontSize, ... } from '@tutor-sg/theme'`

**Reality:** The `@tutor-sg/theme` package is missing 5 files on this branch:

| File | Status |
|---|---|
| `packages/theme/src/index.ts` | untracked, not committed |
| `packages/theme/src/tokens/typography.ts` | untracked, not committed |
| `packages/theme/src/utils/fontScale.ts` | untracked, not committed |
| `packages/theme/package.json` | untracked, not committed |
| `packages/theme/tsconfig.json` | untracked, not committed |

Only `packages/theme/src/tokens/colors.ts` exists on the branch. Commit `7135b3e25` (AAAS-294 M0-9) on another branch has these files — they must be committed here too.

### 2. Components hardcode font sizes / touch targets — no Dynamic Type

All new components use `const MIN_BODY_SIZE = 16` and `const MIN_TOUCH_TARGET = 44` directly instead of `scaledFontSize('body')` and `scaledTouchTarget()`. The standard explicitly mandates `PixelRatio.getFontScale()`-aware scaling with 1.5x cap. Hardcoded constants do not support kids who need larger text.

### 3. KidScreenHeader is dead code

Defined at `mobile/app/(kid)/_layout.tsx:7` but never rendered in the `KidLayout` export. Provides no accessibility value until wired in.

### 4. _layout.tsx hardcoded color — no dark mode

`screenTitle` style uses `color: '#1A1A1A'` — invisible on dark backgrounds.

## Non-blocking

- ErrorBoundary buttons have `accessibilityRole` + `accessibilityLabel` but no `accessibilityHint` (standard calls for all three)
- `packages/llm/` files from AAAS-437/AAAS-439 appear in the branch diff (branch contamination)

## Fix Path

1. Commit missing theme files to branch (index.ts, typography.ts, fontScale.ts, package.json, tsconfig.json)
2. Rewire ErrorBoundary, AccessiblePressable, _layout.tsx to import from `@tutor-sg/theme` using `scaledFontSize()` and `scaledTouchTarget()`
3. Wire KidScreenHeader into layout or export for screen use
4. Add dark-mode-aware title color in _layout.tsx

## Escalation

Foxy escalated to Bee (coder) on 2026-05-08 due to Flutter unresponsive ~24h. Awaiting Bee's fixes before re-review.
