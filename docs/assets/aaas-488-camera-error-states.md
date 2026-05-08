# AAAS-488: Camera Error States — UI Handoff

## Branch
`feat/aaas-488-camera-error-states`

## Files

| File | Purpose |
|---|---|
| `mobile/src/components/camera/CameraErrors.tsx` | Camera error UI component |
| `mobile/src/services/lowLightDetector.ts` | Low-light detection from EXIF |
| `mobile/src/components/camera/__tests__/CameraErrors.test.tsx` | Component tests |
| `mobile/src/services/__tests__/lowLightDetector.test.ts` | Service tests |
| `mobile/src/i18n/locales/en.json` | EN i18n strings |
| `mobile/src/i18n/locales/zh-Hans.json` | zh-Hans i18n strings |

## Screen States

| State | Icon | Layout | Actions |
|---|---|---|---|
| Permission denied | 🚫 | Full-screen center | Open Settings, Type instead, Go back |
| Unavailable | 📷 | Full-screen center | Try again, Type my question, Go back |
| Low-light | 🌙 | Modal overlay card | Try again, Continue anyway |
