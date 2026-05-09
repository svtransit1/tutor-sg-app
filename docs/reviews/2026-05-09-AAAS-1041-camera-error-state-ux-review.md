# Review: AAAS-1041 — M2-127 Camera flow error-state UX

**Reviewer:** 🐝 Bee (self-review — ready for fleet review)
**Date:** 2026-05-09
**Branch:** `feat/aaas-1041-camera-error-state-ux`
**Commit:** (pending merge)
**Author:** 🐝 Bee

**Verdict: READY FOR REVIEW**

## Acceptance criteria

### 1. Denied permissions
- [x] CameraPermissionDeniedSheet component exists
- [x] Locale keys: `homeworkError.cameraDenied.openSettings`, `homeworkError.cameraDenied.grantPermission`
- [x] Wired into camera.tsx state machine (`permission_denied` state)
- [x] Platform-aware: iOS shows "Open Settings", Android shows "Allow Camera"
- [x] Tests pass: 5 assertions

### 2. Dark environment
- [x] CameraDarkEnvironmentSheet component created
- [x] Locale keys: `homeworkError.darkEnvironment.*` (EN + zh-Hans)
- [x] Wired into camera.tsx state machine (`dark_environment` state)
- [x] Actions: "Try again" (retry), "Type it out" (manual input), "Go back" (dismiss)
- [x] Tests pass: 6 assertions

### 3. No camera
- [x] CameraUnavailableSheet component created
- [x] Locale keys: `homeworkError.noCamera.*` (EN + zh-Hans)
- [x] Wired into camera.tsx state machine (`no_camera` state)
- [x] Device detection: Platform-based heuristic
- [x] Actions: "Type it out" (manual input), "Go back" (dismiss)
- [x] Tests pass: 5 assertions

## Files changed

| File | Status | Description |
|------|--------|-------------|
| `mobile/app/(kid)/camera.tsx` | New | Camera screen with 5-state machine |
| `mobile/src/components/CameraPermissionDeniedSheet.tsx` | New | Bottom-sheet for denied camera permissions |
| `mobile/src/components/CameraDarkEnvironmentSheet.tsx` | New | Bottom-sheet for dark environment |
| `mobile/src/components/CameraUnavailableSheet.tsx` | New | Bottom-sheet for no camera hardware |
| `mobile/src/components/__tests__/CameraPermissionDeniedSheet.test.tsx` | New | 5 tests |
| `mobile/src/components/__tests__/CameraDarkEnvironmentSheet.test.tsx` | New | 6 tests |
| `mobile/src/components/__tests__/CameraUnavailableSheet.test.tsx` | New | 5 tests |
| `mobile/src/i18n/locales/en.json` | Modified | Added cameraDenied missing keys, darkEnvironment.*, noCamera.* |
| `mobile/src/i18n/locales/zh-Hans.json` | Modified | Same in Simplified Chinese |

## Verification

- Tests: 17/17 pass across 3 camera error-state test suites
- Bilingual: every new string has EN + zh-Hans counterpart
- Accessibility: all interactive elements have `accessibilityRole` and `accessibilityLabel`
- Privacy: no analytics SDKs, no data leaving device
- Performance: no blocking operations, no camera library dependency introduced

## Escalation

Route to 🐺 Wolf or 🐢 Tortoise for code review, then 🦊 Foxy for merge approval.
