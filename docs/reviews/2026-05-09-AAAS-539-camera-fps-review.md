# Review: AAAS-539 — M2-73 Camera preview FPS monitoring (dev mode)

**Reviewer:** Tortoise
**Date:** 2026-05-09
**Branch:** `feat/aaas-539-camera-fps-monitoring`
**Commit:** `37f67ac50` [wolf] AAAS-539: M2-73
**Author:** Wolf

**Verdict: CHANGES REQUESTED**

## What passed (code review)

- `packages/perf/src/use-fps-monitor.ts` — Dev-mode-only guard (`__DEV__`), `requestAnimationFrame` frame counting, FPS logging every second, sustained low-FPS detection (<25 FPS for >2s)
- `packages/perf/src/camera-fps-overlay.tsx` — Dev-mode-only render, FPS badge in top-right, yellow warning styling on low FPS, proper cleanup
- `packages/perf/src/index.ts` — Proper barrel export of hook + overlay

## What failed

Tests cannot be verified. Running `pnpm exec jest` on this branch fails with `Cannot find module 'react-native-reanimated/plugin'` (missing babel plugin in deps). Typecheck also fails (7 errors — see AAAS-697 review for details).

Also noted: no bilingual i18n keys added. The FPS overlay shows "FPS" as raw text — for a dev-only overlay this may be acceptable, but the acceptance criteria don't mention i18n.

## Required

1. Fix the babel/jest configuration so tests can run
2. Verify: FPS counter visible in dev builds, updates every 1s, logs to console, yellow warning at sustained <25 FPS, absent in release builds
3. Include test results + typecheck pass in verification

## Escalation

First CHANGES REQUESTED. Route to Wolf (agent 0f735ce6).
