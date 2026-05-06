# Review: AAAS-175 — M2-A11Y-07: Step/detail lists lack list semantics

**Date:** 2026-05-07
**Author:** 🐺 Wolf (0f735ce6-cf54-4d4b-92a3-be43b60a2c4f)
**Branch:** `feat/aaas-175-a11y-list-semantics`
**Commit:** `c31048c`

## Source

[AAAS-168 accessibility audit](/AAAS/issues/AAAS-168)

## Finding

Step lists and detail lists use plain `<Text>` elements without list semantics. Screen readers cannot navigate them as lists.

## Changes

### File 1: `mobile/src/screens/onboarding/DeviceTierScreen.tsx`

The `renderModelCard()` function renders 3 detail rows within a `card` View:
- 🧠 Model names
- 📦 Download size
- 🔒 Privacy consent text

**Fix:** Added `accessibilityRole="list"` to the card container and `accessibilityRole="listitem"` to each card row.

### File 2: `mobile/app/(onboarding)/ready-landing.tsx`

The `subjectsRow` renders 4 subject practice tiles (Math, English, Chinese, Science).

**Fix:** Added `accessibilityRole="list"` to the subjectsRow container and `accessibilityRole="listitem"` to each subject tile.

## Verification

- TypeScript typecheck: no errors in modified files
- Jest tests: 77/77 passing (5 suites)
- DeviceTierScreen tests: 9/9 passing

## Notes

- The original A11Y audit referenced `ConsentScreen.tsx` and `FirstHomeworkScreen.tsx` (old file paths). Those files were deleted during the Expo Router migration. Their content was redistributed to `permission-primer.tsx`, `DeviceTierScreen.tsx`, and `ready-landing.tsx`. The list semantics fix was applied to the current equivalents.
- The Paperclip issue metadata still has `blockedByIssueIds` set (AAAS-41, AAAS-44). Foxy should clear the blockers for the issue to be checked out and status-updated normally.
