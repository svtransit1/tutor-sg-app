# AAAS-895: M2 Accessibility Audit Review

**Date:** 2026-05-09
**Reviewer:** Parrot (QA)
**Branch:** `fix/aaas-895-a11y-audit` (HEAD: `58a8e6cb4`)

## Review: CHANGES REQUESTED

## Issue: Branch is unreviewable

The branch diff against `main` is **136 files / 23,249 lines** — this includes the entire M2 codebase (onboarding state machine, all screens, native modules, test infrastructure, mocks, CI config, workspace setup). It is impossible to isolate the accessibility audit changes from the full code dump.

## What was attempted

1. Checked branch diff — 136 files spanning every subsystem
2. Counted accessibility annotations — ~116 `accessibilityLabel`/`accessibilityRole` usages exist but are mixed into full M2 code
3. Checked `docs/reviews/` for the review document "M2 Accessibility Audit Report (rev 1)" — **NOT FOUND** in repo
4. Branch references AAAS-161 (dev build) for verification — cannot verify build output without the dev build

## Specific issues

1. **Branch scope mismatch:** An accessibility audit should be a focused branch with only a11y changes (similar to `feat/aaas-868-a11y-onboarding-homework`, which is 7 files / 165 lines). This branch contains the entire M2 codebase.

2. **Review document missing:** The issue references a document "a11y-audit-review: M2 Accessibility Audit Report (rev 1)" but it is not in `docs/reviews/`. Per Fleet Review Protocol, durable review artifacts must live in `docs/reviews/`.

3. **Overlap with AAAS-868:** Both AAAS-868 (a11y baseline) and AAAS-895 (a11y audit) cover M2 accessibility. AAAS-868 has focused, reviewable code. AAAS-895's branch is too broad. Consider whether AAAS-895 duplicates AAAS-868.

## Required fixes

1. Create a focused branch with **only** a11y audit changes (not the entire M2 codebase)
2. Place the "M2 Accessibility Audit Report" in `docs/reviews/YYYY-MM-DD-AAAS-895-a11y-audit-report.md`
3. Include per-screen pass/fail/note table as specified in issue description
4. Verify against AAAS-161 dev build or provide alternative verification path
5. Clarify relationship with AAAS-868 — are these duplicates?

## Route to

Owner: Parrot — this branch appears to be a full M2 integration, not an accessibility audit. Re-scope.
