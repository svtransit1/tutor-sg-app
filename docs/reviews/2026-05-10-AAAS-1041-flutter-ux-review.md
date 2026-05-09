# AAAS-1041 UX Review — M2-127 Camera Error-State Flows

**Date:** 2026-05-10
**Reviewer:** Flutter (🦋) — UX/UI Designer
**Status:** ❌ CHANGES REQUESTED
**Branch:** `feat/aaas-1041-camera-error-state-ux`
**Commit:** `31cab6e9b`
**Producer:** 🐝 Bee

## Summary

Three bottom-sheet components for camera error states (permission denied, dark environment, no camera) wired into a 5-state machine. Visual design is clean and consistent. However, 3 UX gaps exist against the task spec:

1. Missing "permission not yet asked" primer state
2. Missing flash toggle in dark environment
3. No real permission request plumbing

## What changed (reviewed)

- `mobile/app/(kid)/camera.tsx` — camera screen with state machine
- `mobile/src/components/CameraPermissionDeniedSheet.tsx` — denied permissions sheet
- `mobile/src/components/CameraDarkEnvironmentSheet.tsx` — dark environment sheet
- `mobile/src/components/CameraUnavailableSheet.tsx` — no-camera sheet
- `mobile/src/components/Skeleton.tsx` — loading skeleton (unrelated but included)
- `mobile/src/i18n/locales/en.json` + `zh-Hans.json` — bilingual strings
- 3 test files (17 tests)

## UX acceptance checklist

### Strengths verified ✅

- [x] Visual consistency: same layout (overlay → dismiss area → content with icon/title/description/actions) across all 3 sheets
- [x] Dark mode: `useColorScheme()` applied to all sheets
- [x] Accessibility: `accessibilityRole` header + button, `accessibilityLabel` on all interactive elements
- [x] Bilingual: every new string in EN + zh-Hans
- [x] Touch targets: `paddingVertical: 14 + fontSize: 16 = 44pt` minimum
- [x] Manual input escape hatch present on all 3 sheets ("Type it out instead")
- [x] Privacy: no analytics SDKs, no external data paths
- [x] Test coverage: 17 tests across 3 suites verify button callbacks

### Gaps against task spec ❌

#### Gap 1: Permission not-yet-asked primer — MISSING

**Spec:** "Camera permission not yet asked: show permission primer before OS dialog"
**Reality:** State machine goes `checking` → `camera_ready`. No primer component, no `permission_not_asked` state. The OS permission dialog is never invoked.

**Impact:** Kid lands on a placeholder screen, then sees the system permission dialog with zero context. User can never reach `permission_denied` because no permission request fires.

**Required:** 
- [ ] Add `permission_not_asked` state to the state machine
- [ ] Create a permission primer component with:
  - Title + illustration + description explaining why camera is needed (kid-friendly)
  - "Allow Camera" button → calls `Camera.requestCameraPermissionsAsync()`
  - "Type it out instead" escape hatch → routes to manual input
  - On grant → transition to `camera_ready`
  - On denial → transition to `permission_denied`
- [ ] Bilingual strings (EN + zh-Hans)
- [ ] Tests for the new component

#### Gap 2: Flash toggle — MISSING

**Spec:** "Dark environment: show 'Need more light' toast, **flash toggle**"
**Reality:** `CameraDarkEnvironmentSheet` has a "Try again" button but no flash/light toggle.

**Required:**
- [ ] Add a "Turn on flash" button to `CameraDarkEnvironmentSheet`
- [ ] Wire the button to toggle camera flash state (state plumbing, actual camera flash integration deferred to when real camera view is implemented)
- [ ] Bilingual string for the flash toggle
- [ ] Test for the flash toggle button callback

#### Gap 3: No real permission request plumbing

**Spec:** The permission denied flow must actually evaluate OS permissions and respond to grant/deny.
**Reality:** `handleOpenSettings` opens iOS settings, `handleRequestPermission` just sets `camera_ready` without calling `Camera.requestCameraPermissionsAsync()`. The `permission_denied` state is unreachable.

**Required:**
- [ ] On mount, call `Camera.getCameraPermissionsAsync()` to determine initial permission state
- [ ] After primer, call `Camera.requestCameraPermissionsAsync()` and branch on result
- [ ] "Open Settings" button should call `Linking.openURL('app-settings:')` — already done for iOS ✅
- [ ] Android should use `Linking.sendIntent('android.settings.APPLICATION_DETAILS_SETTINGS')` or similar
- [ ] Test the permission request flow end-to-end

## File-level observations

- `camera.tsx:43-47` — device heuristic (`Platform.isPad`) is fragile; real camera module detection should use `expo-camera`'s `Camera.getCameraPermissionsAsync()` or a `Camera.getAvailableCameraTypes()`-style API
- `camera.tsx:75-81` — `checking` and `camera_ready` show identical placeholder UI; `checking` should show a loading spinner instead of the same content
- Three sheets share nearly identical layout code (overlay, dismissArea, content, iconWrap, actions, actionBtn, dismissBtn patterns) — could be extracted to a shared `CameraErrorSheet` base component in a follow-up

## Route

Route back to 🐝 Bee for the 3 gap fixes above. After fixes, re-request Flutter UX review.
