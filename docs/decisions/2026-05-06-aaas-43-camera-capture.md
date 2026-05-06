# AAAS-43: Camera Capture Screen — Decision Record

**Date:** 2026-05-06
**Author:** 🐝 Bee

## Changes Made

### 1. Native Document Scanner (auto-crop + perspective correction)

Created `mobile/modules/expo-document-camera/` — an Expo Module wrapping:

- **iOS:** `VNDocumentCameraViewController` (built-in since iOS 13) — auto-crop, deskew, perspective correction
- **Android:** Google ML Kit Document Scanner API (`com.google.mlkit:document-scanner:16.0.0-beta1`) — same capabilities

The JS API exposes `scanDocumentAsync()` which opens the native scanner UI modally and returns a cropped, perspective-corrected image. The camera screen (`camera.tsx`) now:

- Checks `isDocumentScannerAvailable()` on mount
- Shows a "ready" screen with a scan button
- On tap, opens the native scanner (Path A)
- Falls back to `expo-camera` viewfinder if native scanner unavailable (Path B)

**Rationale:** The platform-native document scanner APIs provide best-in-class auto-crop and perspective correction without custom CV code. Both are free, built-in (iOS) or via Google Play Services (Android).

### 2. Low-Light Hint (replaces flash toggle)

Replaced the flash toggle (`☀️`/`⚡`/`🔦` cycle) with an exposure-brightness hint system:

- Added `checkImageBrightnessAsync(uri)` to the native module — samples image pixels and computes average luminance
- After scanning/capture, if brightness < 50 (very dark): shows orange banner "The photo is very dark. Try scanning in a brighter area."
- If brightness 50–100 (dim): shows "The photo is a bit dark. Consider improving the lighting."
- Banner is dismissible with ✕ button
- Viewfinder path shows a non-blocking tip: "Move to a well-lit area for best results"

**Rationale:** Kids may scan in poor lighting, leading to failed OCR. The EV-poor hint is more actionable than a flash toggle (which doesn't help with ambient light). The native document scanner handles flash internally.

### 3. Maestro Flow — Deterministic Accept Path

Updated `camera-capture.yaml`:

- "Use This Photo" and "Retake" assertions are now **non-optional** (must exist)
- "Use This Photo" tap (accept path) is **non-optional** — the flow will fail if confirm button isn't found
- "Processing..." wait is **non-optional** — must show spinner
- Only truly variable steps (e.g., which onboarding screens appear, feedback vs manual-input routing) remain optional

**Rationale:** The previous flow could pass without ever hitting the confirm/accept path because all critical steps were optional.

### 4. Bilingual Strings

Added to both `en.json` and `zh-Hans.json`:

- `captureFailed` — error message for capture failure
- `readyTitleScanner` / `readyTitleCamera` — ready screen titles
- `readyInstructions` — ready screen instructions
- `startScan` / `openCamera` — button labels
- `lowLightVeryDark` / `lowLightDim` / `lowLightViewfinder` — low-light hints

### 5. Sandbox Cleanup

Unchanged from previous implementation:
- Photo saved to app cache directory only (never camera roll, never uploaded)
- `deletePhoto` called on retake and screen unmount
- `useEffect` cleanup fires on navigation away

## Files Changed

- `mobile/modules/expo-document-camera/` (new) — Native document scanner Expo Module
  - `expo-module.config.json`
  - `src/index.ts` — JS API
  - `ios/DocumentCameraModule.swift` — iOS wrapper for VNDocumentCameraViewController
  - `android/build.gradle` — Android module build config
  - `android/src/main/java/expo/documentcamera/DocumentCameraModule.kt` — Android wrapper for ML Kit Scanner
- `mobile/app.json` — Registered modules plugin
- `mobile/app/(app)/camera.tsx` — Rewritten with native scanner, low-light hint, ready screen
- `mobile/src/i18n/en.json` — New camera strings
- `mobile/src/i18n/zh-Hans.json` — New camera strings (simplified Chinese)
- `mobile/.maestro/flows/camera-capture.yaml` — Deterministic accept path

## Verification

- Build: `npm run typecheck` (TypeScript compile)
- Maestro: Flow validates all critical path steps are non-optional
- Native module: Exists at `modules/expo-document-camera/` with both iOS and Android implementations

## Next Steps

- Build native app (`expo prebuild && expo run:ios` / `expo run:android`) to verify native module compiles
- Run Maestro flow on real iOS device + Android emulator
- Consider adding a brightness-check unit test
