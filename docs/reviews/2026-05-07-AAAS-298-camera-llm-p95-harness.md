# Review: Camera→LLM P95 Latency Measurement Harness

**Issue:** [AAAS-298](/AAAS/issues/AAAS-298) — M2-8: Camera→LLM P95 latency measurement harness
**Branch:** `feat/aaas-298-camera-llm-p95-harness`
**Commit:** `86714dd`
**Reviewed by:** 🦜 Parrot (Tester)
**Date:** 2026-05-07

## What was built

New `@tutor-sg/perf` package at `packages/perf/`:

| File | Purpose |
|---|---|
| `src/types.ts` | Pipeline stage interfaces, timing types, latency report structure, harness config |
| `src/stats.ts` | `computeLatencyStats()` — P50/P95/P99/mean/stddev/min/max from raw durations |
| `src/harness.ts` | `LatencyHarness` class — runs pipeline N times, records per-stage timing, produces `LatencyReport`; `formatReport()` for text output |
| `src/stages.ts` | Simulated pipeline stages with log-normal latency distributions; `fastMode` option for CI (computes durations without real setTimeout) |
| `src/index.ts` | Barrel re-exports |

## Pipeline stages modeled

Per ADD §3.5 and ARCHITECTURE §4.1:

1. `camera_capture` — Camera capture + frame preparation
2. `ocr` — Platform OCR (Apple Vision / ML Kit)
3. `question_segmentation` — Question separation + classification
4. `llm_inference` — LLM inference (Gemma E4B/E2B or Qwen 4B/2B)
5. `response_rendering` — Structured response rendering in chat UI

## Verification evidence

```
Test Files  1 passed (1)
     Tests  27 passed (27)
 Start at  07:50:59
 Duration  1.47s
```

**27 tests covering:**
- Stats computation: min/max/mean, P50 odd/even, P95, P99, stddev, single-element, empty-dataset error
- Harness: single stage, full pipeline, input chaining, device tier reporting, warmup exclusion, inter-iteration delay
- Simulated pipeline: stage names, tier profiles, fast mode, report generation
- Report formatting: timestamp, P50/P95, ADD target pass/fail
- Edge cases: single iteration, zero delay, zero warmup

## ADD §3.5 compliance

The report's `formatReport()` function checks ADD targets:
- High tier: P95 < 8000 ms → PASS/FAIL
- Mid/low tier: P95 < 15000 ms → PASS/FAIL

## Next actions for reviewers

1. Review types and harness API for correctness
2. Verify simulated log-normal distribution parameters match expected real-world latencies
3. Once real pipeline implementations land (M2 camera, M2 OCR, M2 LLM bridge), integrate by passing real `PipelineStage` implementations to `LatencyHarness`
4. Run on physical device matrix to set baseline and validate ADD §3.5 targets

## Files changed (vs main)

```
packages/perf/package.json                         |  15 +
packages/perf/src/__tests__/latency-harness.vitest.ts | 347 ++++++++
packages/perf/src/harness.ts                       | 192 ++++++++
packages/perf/src/index.ts                         |  33 ++
packages/perf/src/stages.ts                        | 128 +++++++
packages/perf/src/stats.ts                         |  59 +++
packages/perf/src/types.ts                         | 111 ++++++
packages/perf/tsconfig.json                        |  20 ++
packages/perf/vitest.config.ts                     |   7 +
9 files changed, 912 insertions(+)
```
