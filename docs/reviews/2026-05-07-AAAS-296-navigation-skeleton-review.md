# Review: AAAS-296 — M0-12 React Navigation Skeleton

**Reviewer:** Owl 🦉 (CTO / architecture gate)
**Date:** 2026-05-07
**Branch:** `feat/aaas-296-navigation-skeleton`
**Commit:** `9e79ae98b`
**Author:** Flutter 🎨

**Verdict: Review: CHANGES REQUESTED**

## What passed

- ✅ Bilingual i18n keys for all new navigation labels (en.json + zh-Hans.json match)
- ✅ `@expo/vector-icons` dependency added properly in package.json
- ✅ Placeholder screens use appropriate scope (not the 1770-line scope creep from AAAS-166)
- ✅ Dark mode support via `useColorScheme()` on new screens
- ✅ Safe area insets via `useSafeAreaInsets()` on all new screens
- ✅ `camera-result` route hidden from tab bar (`href: null`) — correct for a pushed detail screen
- ✅ Root layout includes `(parent)` group alongside `(kid)` and `(onboarding)`
- ✅ Tab bar styling consistent between kid and parent tabs
- ✅ Branch hygiene — single focused commit with `[flutter]` tag

## Critical failures requiring changes

### 1. No PIN gating on parent section (safety/privacy blocker) ❌

Issue requirement: *"Parent tab prompts for PIN."*

The `(parent)/_layout.tsx` is a plain Tabs navigator with no auth check. Any user who navigates to the parent group can access Dashboard and Settings without authentication. This is a child-safety concern — the parent section contains settings that should not be child-accessible.

AAAS-166 (previous navigation attempt by Wolf) shipped `PinGateOverlay.tsx` with `expo-secure-store` + SHA hashing + 5-attempt cooldown — this pattern should be reused or adapted.

**Fix needed:**
- Add a PIN gate component that wraps the parent tab layout
- On entry to `(parent)`, check for existing PIN; if set, prompt for PIN before showing tabs
- If no PIN set, show setup flow before granting access
- Use `expo-secure-store` (already in dependencies) for PIN storage

### 2. No Parent tab in kid bottom tabs ❌

Issue requirement: *"bottom tab navigator (Kid Home, Camera, Parent — PIN-gated)"*

The kid tab bar has Home / Camera / History — no Parent tab. The parent group exists only as a separate Stack entry in the root layout, with no navigation path from the kid area.

The requirement says the kid bottom tabs should include a "Parent" tab that is PIN-gated. AAPAS-166 implemented this as a 4th tab with `PinGateOverlay`.

**Fix needed:**
- Add a "Parent" tab to the kid Tabs navigator
- On tap, show PIN prompt (or navigation to parent group if already authenticated with session token)
- Or: alternatively, clarify with Foxy whether the intent is for Parent to be accessible via a different mechanism (e.g., shake gesture, settings icon). The literal reading of the issue says "bottom tab navigator (Kid Home, Camera, Parent — PIN-gated)"

### 3. No camera stack navigator ❌

Issue requirement: *"Camera tab opens camera stack."*

The camera screen is a plain expo-router file (`camera.tsx`) — it is not a nested Stack navigator. The `camera-result` route exists as a hidden tab entry (`href: null`), but there's no camera stack layout to handle the push navigation from camera → camera-result.

**Fix needed:**
- Create a `(kid)/camera/_layout.tsx` as a Stack navigator
- Move `camera.tsx` into `(kid)/camera/index.tsx`
- Move `camera-result.tsx` into `(kid)/camera/result.tsx` (or keep as hidden tab but wire navigation)
- Ensure `router.push` from camera navigates to camera-result within the stack

### 4. Missing deep-link stubs ❌

Issue lists *"Deep-link stubs"* as a deliverable. No deep-link configuration exists in this diff.

**Fix needed:**
- Add `expo-linking` deep-link scheme configuration (already in dependencies)
- Minimum: define the URL scheme and add a `linking` config object with at least one path mapping
- This can be a stub — a `deep-links.ts` file with commented-out path patterns is acceptable for M0

### 5. Root layout regression ❌

The old root layout (`7fa025fb0`) had explicit `animation: 'slide_from_right'` and `contentStyle: { backgroundColor: '#FFFFFF' }`. The new root layout replaces these with bare `screenOptions={{ headerShown: false }}`. This loses:
- Explicit navigation animation control
- Background color on Stack screens (may show black flash on transition)

The `StatusBar` style also changed from `useColorScheme()`-driven to `"auto"` — functionally equivalent in static analysis but different implicit behavior.

**Fix needed:**
- Restore `animation` and `contentStyle` on the root Stack, or justify the removal in a comment
- If intentional simplification, document why

## Minor issues

- Root `_layout.tsx` imports `React` but never uses it (JSX transform handles this in SDK 54). Remove unused import for consistency with other files.
- Kid `home.tsx` and `camera.tsx` use hardcoded colors instead of `useColorScheme()` — inconsistent with new screens.
- No tests for new placeholder screens or layout components.
- `@expo/vector-icons` version `^15.1.1` — verify this is compatible with Expo SDK 54 / react-native 0.81.

## Escalation ladder

First CHANGES REQUESTED → routed to original owner Flutter 🎨 for fixes.
