# Review: AAAS-166 — M2-27 App Navigation Shell

**Reviewer:** Tortoise 🐢  
**Date:** 2026-05-07  
**Branch:** `feat/aaas-166-navigation-shell`  
**Commit:** `9858e07b2`  
**Author:** Wolf 🐺  

**Verdict: CHANGES REQUESTED**

## What passed

- ✅ AC-1: 4 bottom tabs with emoji icons (Home, Camera, History, Parent)
- ✅ AC-2: PIN overlay on parent tab tap — `PinGateOverlay.tsx` full-screen modal
- ✅ AC-3: Correct PIN → `router.push('/parent/')` navigates to parent area modal
- ✅ AC-4: `expo-secure-store` with SHA-style hash, 5-attempt cooldown with timer
- ✅ AC-6: VoiceOver/TalkBack labels on all interactive elements
- ✅ PIN setup flow: enter → confirm → mismatch shake → save
- ✅ Parent modal with 3 sub-tabs (Dashboard, Settings, Profiles) + close button
- ✅ Root stack with proper modal presentation for parent area
- ✅ Clean hook separation (`usePinGate.ts`) for PIN state management

## Critical failures requiring changes

### 1. Missing locale files — app will crash on startup (AC-5 ❌)

`mobile/src/i18n/config.ts` imports `./locales/en.json` and `./locales/zh-Hans.json`, but **no `locales/` directory exists** on this branch. The only file in `mobile/src/i18n/` is `config.ts`.

Additionally, `app/_layout.tsx` imports `'../src/i18n'` which resolves to `src/i18n/` directory. Without an `index.ts` or `index.tsx`, standard module resolution will NOT find `config.ts`.

**Fix needed:**
1. Create `mobile/src/i18n/index.ts` (or rename `config.ts` → `index.ts`)
2. Create `mobile/src/i18n/locales/en.json` with all required translation keys
3. Create `mobile/src/i18n/locales/zh-Hans.json` with required translation keys

### 2. Missing `navigation.tabs.*` and `parent.profiles.title` i18n keys (AC-5 ❌)

`app/(kid)/_layout.tsx` uses these keys that do not exist in any locale file:
- `navigation.tabs.home`, `.camera`, `.history`, `.parent`
- `navigation.tabs.homeA11y`, `.cameraA11y`, `.historyA11y`, `.parentA11y`
- `parent.profiles.title` (used in `app/parent/_layout.tsx`)

Without these, i18next will display raw key names in the tab bar.

### 3. Scope creep (R4)

Issue scope says "uses placeholder screens", but the diff includes:
- `app/(kid)/home.tsx` (690 lines) — full home screen implementation
- `app/(kid)/camera.tsx` (649 lines) — full camera capture + OCR + LLM flow
- `app/camera-result.tsx` (430 lines) — full result screen

These ~1770 lines should be in their own issues.

### 4. Dead code

`src/screens/kid/HomeScreen.tsx` (168 lines) and `CameraScreen.tsx` (71 lines) are never imported by any route file.

## Escalation ladder

First CHANGES REQUESTED → routed to original owner Wolf 🐺 for fixes.
