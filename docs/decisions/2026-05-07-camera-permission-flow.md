# Camera Permission Flow — iOS + Android

Date: 2026-05-07
Issue: AAAS-304 (M2-23)
Author: Bee

## Summary

Implemented robust camera permission request flow covering iOS and Android, with
three distinct UI states: loading, denied (can ask again), and blocked
(permanently denied — must go to Settings). Also updated the onboarding
permission-primer screen (cherry-picked from AAAS-232).

## Files changed

| File | Change |
|------|--------|
| `mobile/app.config.ts` | New — Expo config with `expo-camera` plugin, iOS `NSCameraUsageDescription`, Android `CAMERA` permission |
| `mobile/src/hooks/useCameraPermissions.ts` | New — custom hook wrapping `expo-camera`'s `useCameraPermissions` with `loading`/`denied`/`blocked` states and `openSettings()` |
| `mobile/src/hooks/__tests__/useCameraPermissions.test.ts` | New — 8 tests covering all permission states, request flow, and reference stability |
| `mobile/__mocks__/expo-camera.ts` | New — mock with `__setMockPermissionState`/`__resetMockPermissionState` helpers and `PermissionStatus` export |
| `mobile/src/i18n/locales/en.json` | Updated — added `cameraScreen.permissionBlocked` and `cameraScreen.permissionDenied` keys |
| `mobile/src/i18n/locales/zh-Hans.json` | Updated — deduplicated and added missing `cameraScreen`, `common`, `cameraResult`, `permissionPrimer` sections |
| `mobile/app/(kid)/camera.tsx` | New — full camera screen with `useCameraPermissions` hook handling blocked (→ Settings) and denied (→ retry) states |
| `mobile/app/(onboarding)/permission-primer.tsx` | Cherry-picked from AAAS-232 — uses `Camera.requestCameraPermissionsAsync()` with permanent-denial detection |

## Permission state machine

```
expoPermission === null → 'loading' (spinner)
granted                  → 'granted' (camera preview)
denied + canAskAgain     → 'denied' (show "Try again" → triggers OS dialog)
denied + !canAskAgain    → 'blocked' (show "Open Settings" → Linking.openURL)
```

## AAAS-232 relationship

AAAS-232 ([Flutter]) built the permission-primer onboarding screen with
`Camera.requestCameraPermissionsAsync()`. AAAS-304 builds the runtime
permission wrapper (`useCameraPermissions` hook) used by the camera screen,
plus the Expo plugin config for iOS/Android permission declarations.

## Verification

- 8/8 hook tests pass
- Bilingual: EN + zh-Hans for all new `cameraScreen.*Blocked` and `*Denied` keys
