# Review: AAAS-232 — Camera Permission Priming Screen

- **Date:** 2026-05-07
- **Owner:** 🦋 Flutter (UX)
- **Branch:** `feat/aaas-232-camera-permission-primer`
- **Commit:** `691bb87`

## What changed

### 1. `mobile/app/(onboarding)/permission-primer.tsx`
Complete rewrite (206 → 637 lines). The original was a stub with hardcoded English fallback strings and no actual permission wiring.

**New UX flow (per Article 12 §3.8):**
1. **Step indicator** "Step 8 of 10" / "第 8 步，共 10 步" at top
2. **Camera card** — icon 📷, title "Camera access", WHY body copy, "Enable camera access" CTA that fires `Camera.requestCameraPermissionsAsync()`, "Not now" deferral
3. **Notifications card** — same pattern with 🔔 icon; notification request is a stub (TODO: wire `expo-notifications` in M3)
4. **Done screen** — ✅ icon, summary of what was granted/deferred, "Continue" CTA
5. **Permanent denial** — If `PermissionResponse.canAskAgain === false`, shows ⚠️ amber banner + ⚙️ "Open Settings" deep link
6. **Privacy footer** — 🔒 "Models run entirely on this device"

**Telemetry:** fires `onboarding_perm_camera` and `onboarding_perm_notif` on each allow/defer.

### 2. `mobile/src/i18n/locales/en.json` + `zh-Hans.json`
Added `permissionPrimer` section with 17 keys each (EN + zh-Hans).

## Verification

- `tsc --noEmit`: 0 errors (clean)
- `jest src/onboarding/`: 34/34 tests pass
- Screen test suite failures are pre-existing (`@testing-library/react-native` peer dep check)

## How to test

1. Run app on iOS Simulator or Android emulator
2. Complete onboarding steps 1–7 (or jump to step 8 via state machine reset)
3. Verify camera card renders with correct EN/zh-Hans copy
4. Tap "Enable camera access" → system dialog should appear (iOS Simulator grants permission by default)
5. If permission was already granted/denied permanently, verify correct state detection
6. Verify "Not now" defers to notifications card
7. Verify done screen shows correct permission summary
8. Test with locale set to zh-Hans

## Next review by

Assign to Tortoise or Owl for code review.
