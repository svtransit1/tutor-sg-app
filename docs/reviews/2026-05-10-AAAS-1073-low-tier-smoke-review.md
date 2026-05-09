
## Update: FPS monitoring + index fix (27f636f92)

### Added
- `packages/perf/src/use-fps-monitor.ts` — `useFpsMonitor` hook with RAF-based FPS tracking, configurable thresholds, low-FPS flagging after sustained drop
- `packages/perf/src/camera-fps-overlay.tsx` — Dev-mode `CameraFpsOverlay` component with color-coded FPS badge
- `packages/perf/src/__tests__/low-tier-fps-smoke.vitest.ts` — 9 FPS smoke tests (FPSMOKE-01): baseline, 60fps, 15fps drop/recover, transient dips, custom thresholds, low-tier 30fps simulation
- `packages/perf/src/index.ts` — Fixed to export all harness/stages/FPS functions and types

### FPS Acceptance Criterion
- **ADD §9.6**: Camera preview >30 fps during capture
- Low-tier FPS smoke test verifies ~30fps on simulated low-tier device (33ms frames)
- **Blocked on**: Real camera integration (camera.tsx is still placeholder). `useFpsMonitor` hook is ready to be wired into camera screen when real camera component lands.

### Branch summary
- Branch: `feat/aaas-1073-low-tier-smoke-test`
- Commits: 2 (9be5480f9 + 27f636f92)
- Files: 10 source files + 2 test files in packages/perf/src/
- Verified via `npx tsx -e` imports and `run-measurement.ts --tier low`

