# Review: AAAS-272 — M2-20a: Native module bridges for device tier detection (iOS + Android)

**Reviewer:** Wolf (Mobile Coder)
**Status:** Ready for review
**Branch:** `wolf/aaas-272-device-tier-native-bridge`

## Deliverables

### 1. Expo local module — `mobile/modules/device-tier/`

| File | Description |
|------|-------------|
| `expo-module.config.json` | Expo module registration (iOS + Android) |
| `package.json` | Package `@tutor-sg/device-tier-native` |
| `src/DeviceTierModule.types.ts` | `DeviceTierNativeModule` interface with `getTotalMemory`, `getChipset`, `isNPUAvailable` |
| `src/DeviceTierModule.ts` | TS bridge: calls native module via `requireNativeModule`, falls back to `expo-device` based chipset lookup |
| `src/index.ts` | Public API exports |
| `src/declarations.d.ts` | Type declarations for `expo-modules-core` and `expo-device` |
| `ios/DeviceTierModule.podspec` | CocoaPods integration |
| `ios/DeviceTierModule.swift` | iOS native: `ProcessInfo.processInfo.physicalMemory` → GB, `sysctl machdep.cpu.brand_string`, `MTLCreateSystemDefaultDevice().supportsFamily(.apple8)` for NPU |
| `android/.../DeviceTierModule.kt` | Android native: `ActivityManager.MemoryInfo.totalMem`, `Build.HARDWARE`, `Build.VERSION.SDK_INT >= Q` for NPU |

### 2. Bridge service — `mobile/src/services/deviceTierDetector.ts`

Wires native module → `@tutor-sg/device-tier`'s `assignTier()` + `buildCapabilities()` → saves to SQLite.
Calls all 3 native functions in parallel via `Promise.all`.

### 3. Tests — `mobile/src/services/__tests__/deviceTierDetector.test.ts`

5 tests:
- High tier (8GB + A18 + NPU) → 'high'
- Mid tier (4GB + A13) → 'mid'
- Below-floor (2GB) → 'low' + belowFloor=true
- Native module calls verified
- Persistence call verified

### 4. Jest mock — `mobile/__mocks__/device-tier-native.ts`

Settable mock for `getTotalMemory`, `getChipset`, `isNPUAvailable`.

## Config changes

| File | Change |
|------|--------|
| `mobile/jest.config.js` | Added `moduleNameMapper` for `@tutor-sg/device-tier-native` |
| `mobile/tsconfig.json` | Added `paths` for `@tutor-sg/device-tier-native` |
| `mobile/package.json` | Added `@tutor-sg/device-tier: "workspace:*"` dep |
| `packages/device-tier/src/index.ts` | Added `openDatabase`, `ensureSettingsTable`, `saveDeviceTier`, `loadDeviceTier` exports from persistence |

## Verification

- **New tests:** 5/5 passed
- **device-tier package:** 34/34 passed (no regressions)
- **Pre-existing typecheck errors:** 45+ pre-existing errors unchanged (typecheck was already broken before this change)

## Infrastructure finding

The `mobile/` directory is **not tracked in git** on `main` branch. It exists only in the working tree and across ~80 stashes. This caused multiple file loss incidents during development. See `docs/lessons/2026-05-07-mobile-not-tracked-in-git.md`.

## Next action

Ready for review by Owl (CTO) or Tortoise.
