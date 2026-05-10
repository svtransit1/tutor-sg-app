# Review: AAAS-1039 — M2-125 Perf Benchmarking — Wolf Review of Tortoise Implementation

**Review: APPROVED** (with fixes applied)

- **Date**: 2026-05-10
- **Branch**: `wolf/feature/m2-125-perf-benchmarking`
- **Commit**: `7c3bec4f2`
- **Base branch**: `feature/m2-125-perf-benchmarking`
- **Reviewer**: Wolf
- **Original author**: Tortoise

## Summary

Tortoise submitted the perf benchmarking harness for review. I reviewed the implementation and identified 3 blockers + 3 minor observations. All issues have been addressed on branch `wolf/feature/m2-125-perf-benchmarking`.

## Blocker Resolution

### B1: Empty barrel exports (index.ts)
**Before**: `export {};`
**After**: Full barrel exports of all public types (`PerfMark`, `PerfSession`, `BenchmarkMetric`, `BenchReport`), constants (`ADD_TARGETS`), timer API (`startSession`, `mark`, `markAbsolute`, `getMarks`, `getDuration`, `reset`, `timestamp`, `now`, `buildSession`), statistics (`p50`, `p75`, `p95`, `p99`, `mean`, `stddev`, `min`, `max`), runner (`runBenchmarks`, `computeMetric`), and reporter (`formatReport`, `emitReport`, `emitReportJson`, `createReport`).

### B2: tsconfig path mapping
**Before**: `include` only covered `src/**/*.ts`; `rootDir` was `./src`. `scripts/bench.ts` was not type-checkable.
**After**: `rootDir` changed to `.`; `include` expanded to `["src/**/*.ts", "scripts/**/*.ts"]`. The `scripts/bench.ts` CLI is now within the tsconfig scope for type-checking.

### B3: Cold-start PerfSession gap
**Before**: No way to build a `PerfSession` from in-app timer marks. The bench CLI expected pre-built JSON.
**After**: Added `buildSession()` to `timer.ts` — takes `(id, scenario, platform?, deviceTier?)` and produces a serialisable `PerfSession` from the current mark state. Added 2 unit tests. Added `scripts/fixtures/sample-sessions.json` with 10 sample sessions (3 cold-start + 7 photo-to-first-token) for bench CLI testing.

## Minor Observation Fixes

### O1: Date.now precision
**Before**: Fallback was `Date.now()` (millisecond resolution).
**After**: Added `process.hrtime.bigint()` fallback with nanosecond → millisecond conversion before falling back to `Date.now()`. Resolution chain: `performance.now()` (μs) → `process.hrtime.bigint()` (ns) → `Date.now()` (ms).

### O2: capture_end baseline
**Before**: No documentation on measurement expectations.
**After**: Added JSDoc to `deriveMetric()` in `runner.ts` clarifying that all marks share the same time origin (session start) and `capture_end` records ms since `startSession()`.

### O3: --passWithNoTests
Already present in package.json test script: `vitest --passWithNoTests`. No change needed.

## Verification

```
31 tests passed (29 original + 2 new buildSession tests)
Bench CLI: 2/2 metrics PASS (cold-start P95=1190ms < 3000ms target; photo-to-first-token P95=6886ms < 8000ms target)
JSON output mode verified
```

## Files Changed

| File | Change |
|------|--------|
| `packages/perf/src/index.ts` | Barrel exports (was `export {}`) |
| `packages/perf/src/timer.ts` | hrtime precision + buildSession helper |
| `packages/perf/src/runner.ts` | capture_end baseline documentation |
| `packages/perf/src/__tests__/timer.test.ts` | +2 buildSession tests |
| `packages/perf/tsconfig.json` | rootDir `.` + include scripts/ |
| `packages/perf/package.json` | +tsx devDep, +bench scripts |
| `packages/perf/scripts/fixtures/sample-sessions.json` | 10 sample sessions |

## Next Action

- Push branch `wolf/feature/m2-125-perf-benchmarking`
- Tortoise to review the fixes
- Merge to `feature/m2-125-perf-benchmarking` if approved
