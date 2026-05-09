# AAAS-1021: Camera Permission Denied — Graceful Fallback Bottom Sheet

**Date:** 2026-05-10
**Designer:** Flutter (UX/UI)
**Status:** Draft — handoff to coder

## Problem

When a kid taps "Snap Homework" but has denied camera permission (or denied permanently), the app must explain why camera is needed and offer alternatives without frustrating the child. This is a **denied-state** bottom sheet, distinct from the initial permission-request screen (AAAS-923).

## UX States

| State | Platform | Behaviour |
|-------|----------|-----------|
| **1. Denied (can ask again)** | Android (first deny) | Show rationale + "Grant Permission" button + manual input fallback |
| **2. Denied permanently (cannot ask again)** | iOS / Android (checked "never") | Show rationale + "Open Settings" button (iOS `Linking.openSettings()`) + manual input fallback |
| **3. Manual input** | Both | Dismiss sheet → navigate to manual text-input screen (same as OCR fallback `manualInputFallback`) |

## Visual Spec

### Layout

```
┌──────────────────────────────────────┐
│  [handle bar — 36px wide, 4px tall]  │  ← drag indicator
│                                      │
│   ⚠️  Camera access needed           │  ← title (icon + bold 18pt)
│                                      │
│   We need the camera to read your     │
│   homework and give you help.         │  ← body text (15pt, #6B7280)
│                                      │
│   🔒 Photos never leave this device   │  ← privacy badge (13pt, green bg)
│                                      │
│   ┌──────────────────────────────┐   │
│   │  Grant Permission /           │   │  ← primary CTA (17pt bold, blue bg)
│   │  Open Settings                │   │     changes based on canAskAgain
│   └──────────────────────────────┘   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  ✏️  Type it out instead      │   │  ← secondary CTA (15pt, gray text)
│   └──────────────────────────────┘   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │          Cancel              │   │  ← dismiss (15pt, light gray)
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Component API

```tsx
interface CameraPermissionDeniedSheetProps {
  visible: boolean;
  canAskAgain: boolean;        // true on Android after first deny, false on iOS / permanent
  onClose: () => void;         // dismiss the sheet, go back
  onOpenSettings: () => void;  // Linking.openSettings()
  onRequestPermission: () => Promise<void>;  // Camera.requestCameraPermissionsAsync()
  onManualInput: () => void;   // navigate to manual input fallback
}
```

### Colour Palette

| Element | Token | Value |
|---------|-------|-------|
| Sheet background | — | `#FFFFFF` |
| Title text | — | `#1A1A1A` |
| Body text | — | `#6B7280` |
| Primary CTA bg | — | `#2563EB` (blue-600) |
| Primary CTA text | — | `#FFFFFF` |
| Privacy badge bg | — | `#F0FDF4` |
| Privacy badge border | — | `#BBF7D0` |
| Privacy badge text | — | `#166534` |
| Secondary CTA text | — | `#6B7280` |
| Cancel text | — | `#9CA3AF` |
| Handle bar | — | `#D1D5DB` |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Title | 18pt | 700 (Bold) |
| Body | 15pt | 400 (Regular) |
| Privacy badge | 13pt | 600 (Semibold) |
| Primary CTA | 17pt | 700 (Bold) |
| Secondary CTA | 15pt | 600 (Semibold) |
| Cancel | 15pt | 500 (Medium) |

### Accessibility

- All buttons have `accessibilityRole="button"` and descriptive `accessibilityLabel`
- Sheet uses `Modal` with `animationType="slide"` (no screen-reader traps)
- Privacy badge uses `accessibilityRole="text"`
- Handle bar is decorative (`accessibilityElementsHidden`)

## i18n Keys

See `cameraPermission.denied.*` keys in locales (see implementation for full values).

## Implementation Notes

1. **No bottom-sheet library needed** — use React Native `Modal` with `animationType="slide"` and a container positioned at the bottom with `justifyContent: 'flex-end'`. This avoids adding `@gorhom/bottom-sheet` and `react-native-gesture-handler`.
2. **Integration point**: The camera screen (`mobile/app/(kid)/camera.tsx`) calls `useCameraPermissions()` from `expo-camera`. When `granted === false`, show this sheet.
3. **Platform branching**:
   - `canAskAgain === true` → "Grant Permission" button that calls `Camera.requestCameraPermissionsAsync()`
   - `canAskAgain === false` → "Open Settings" button that calls `Linking.openSettings()`
4. **Manual input fallback** navigates to the same flow as OCR fallback (`manualInputFallback`).
5. **Dark mode**: Not required for v1 bottom sheet (borrows from cameral screen black backing).
