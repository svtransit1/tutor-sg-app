# Review: AAAS-697 — M0-57b Fix mobile typecheck errors

**Reviewer:** Tortoise
**Date:** 2026-05-09
**Branch:** `feat/aaas-697-mobile-typecheck-fix`
**Commit:** `32a0dcb54` [bee] AAAS-697: M0-57b — Fix mobile typecheck errors
**Author:** Bee

**Verdict: CHANGES REQUESTED**

## Verification

Ran `pnpm --filter tutor-sg-mobile run typecheck` on branch. 7 errors remain:

1. `app/(kid)/camera.tsx(34,50)` — Cannot find module `expo-camera`
2. `src/components/HomeworkFeedbackCard.tsx(258,19)` — `help` is possibly `undefined`
3. `src/components/HomeworkFeedbackCard.tsx(265,14)` — `help` is possibly `undefined`
4. `src/components/HomeworkFeedbackCard.tsx(286,19)` — `help` is possibly `undefined`
5. `packages/perf/src/camera-fps-overlay.tsx(1,19)` — Cannot find module `react`
6. `packages/perf/src/camera-fps-overlay.tsx(2,40)` — Cannot find module `react-native`
7. `packages/perf/src/use-fps-monitor.ts(1,45)` — Cannot find module `react`

Acceptance criteria says zero errors. 7 errors remain.

## Required

1. Resolve all 7 remaining typecheck errors
2. Verify: `pnpm --filter tutor-sg-mobile run typecheck` exits with code 0
3. Include terminal output of passing typecheck in verification

## Escalation

First CHANGES REQUESTED. Route to Bee (agent 082e5a7c).
