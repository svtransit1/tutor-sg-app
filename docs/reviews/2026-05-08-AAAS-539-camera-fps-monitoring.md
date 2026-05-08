# AAAS-539 M2-73: Camera preview FPS monitoring (dev mode)

**Date:** 2026-05-08
**Status:** Ready for review
**Author:** Wolf (opencode_local)

## What changed

New `@tutor-sg/perf` package with camera preview FPS monitoring:

| File | Role |
|---|---|
| `packages/perf/src/fps-monitor.ts` | `FpsMonitor` class — rAF-based FPS tracker, rolling window, color thresholds |
| `packages/perf/src/use-fps-monitor.ts` | `useFpsMonitor` hook — wraps FpsMonitor, 1s poll, console.log, sustained low-FPS detection |
| `packages/perf/src/camera-fps-overlay.tsx` | `CameraFpsOverlay` — dev-only badge (top-right), flashing ⚠ banner when <25 FPS for >2s |
| `packages/perf/src/perf-metrics.ts` | Preserved `PerfMetrics` interface + `getPerfMetrics` stub |
| `packages/perf/src/index.ts` | Package barrel exports |
| `packages/perf/src/globals.d.ts` | React Native ambient type declarations |
| `mobile/src/i18n/locales/{en,zh-Hans}.json` | `kidHome.camera.devFpsLabel` / `devFpsAccessibility` strings |

Also created `tsconfig.base.json` (missing from this branch, needed by all packages).

## Acceptance criteria

| Criteria | Evidence |
|---|---|
| FPS counter in dev only | `CameraFpsOverlay` returns `null` when `!__DEV__` |
| Updates every second | `setInterval(1000ms)` in `useFpsMonitor` |
| Console logging | `console.log('Camera FPS: {n}')` inside `__DEV__` gate |
| Warning at <25 FPS >2s | `lowFpsSince` ref tracks duration → `lowFpsWarning` → flashing `Animated.View` |
| Not in release | `__DEV__` guard; tree-shaken in production |
| Bilingual | EN + zh-Hans strings in locale files |

## Verification

- **Typecheck:** clean
- **Lint:** clean
- **Tests:** 3 suites, 21 tests, all passing

## Integration

```tsx
import { useFpsMonitor, CameraFpsOverlay } from '@tutor-sg/perf'

// In CameraScreen or any camera preview component:
const { stats, lowFpsWarning } = useFpsMonitor()

return (
  <View style={{ flex: 1 }}>
    <CameraView ... />
    <CameraFpsOverlay stats={stats} lowFpsWarning={lowFpsWarning} />
  </View>
)
```

## Next reviewer

Owl (CTO) — architecture review for new package structure and React Native dependency addition.
