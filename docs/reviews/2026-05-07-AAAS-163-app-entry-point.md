# Review: CHANGES REQUESTED

**Issue:** AAAS-163 — M0-33: app/ package entry point  
**Commit:** 9448dfc81f6357a5a195816111441c1b14fe16f2  
**Branch:** aaas-163/app-entry-providers  
**Reviewer:** 🐢 Tortoise  
**Date:** 2026-05-07

---

## Summary

The implementation creates the minimal Expo app entry shell with all four required providers (SafeAreaProvider, ThemeProvider, I18nextProvider, GestureHandlerRootView) and supporting files (theme stub, i18n init, locale files, app.json, root layout). The architecture and code quality are sound.

However, two missing dependencies cause `tsc --noEmit` failures in the AAAS-163 code, which must be resolved before this can ship.

---

## R1. Acceptance criteria — ✅ content scope met

| Criteria | Status |
|----------|--------|
| App.tsx exists with all required providers | ✅ |
| Loading text "tutor-sg — loading..." centered | ✅ (via i18n key `app.loading`) |
| Bilingual en + zh-Hans locale files | ✅ |
| Redbox/yellowbox on launch | ⚠️ Cannot verify without simulator |

All four providers are wired in the correct architectural order in `App.tsx`.

## R2. Branch & commit — ✅ found

- Branch: `aaas-163/app-entry-providers` (pushed to origin)
- Commit: `9448dfc81f6357a5a195816111441c1b14fe16f2`
- `git log --oneline` shows clean AAAS-163 commit

Note: The branch has been fast-forwarded with two subsequent commits (AAAS-206 and AAAS-22) that add scope-crept files. This doesn't affect the review of `9448dfc` itself but should be noted for branch hygiene.

## R3. TypeScript — ❌ FAILS

Running `npx tsc --noEmit` in `mobile/` reveals **two errors in AAAS-163 code**:

1. **`app/App.tsx(7,40): Cannot find module 'react-native-gesture-handler'`**
   - `react-native-gesture-handler` is imported in `App.tsx` but is **not listed in `mobile/package.json` dependencies** and **not installed in `node_modules/`**.
   - **Fix:** Run `npx expo install react-native-gesture-handler` and add it to `dependencies`.

2. **`src/i18n/index.ts(3,30): Cannot find module 'expo-localization'`** (indirect — this error only shows in CI/clean install)
   - `expo-localization` is used in `src/i18n/index.ts` but **not listed in `mobile/package.json` dependencies**. It exists in `node_modules/` only as a transitive dependency of `expo`.
   - **Fix:** Run `npx expo install expo-localization` and add it to `dependencies`.

## R4. Scope discipline — ✅ clean

All 7 files in commit `9448dfc` trace directly to AAAS-163:

```
mobile/app.json
mobile/app/App.tsx
mobile/app/_layout.tsx
mobile/src/theme/theme.tsx
mobile/src/i18n/index.ts
mobile/src/i18n/locales/en.json
mobile/src/i18n/locales/zh-Hans.json
```

No "while I was here" changes.

## R5. i18n — ✅ compliant

- `app.loading` key present in both `en.json` and `zh-Hans.json`
- No hardcoded user-facing strings in code
- Bilingual contract upheld

---

## Required fixes

1. **Add `react-native-gesture-handler`** to `mobile/package.json` dependencies
2. **Add `expo-localization`** to `mobile/package.json` dependencies

After adding both, re-run `npx tsc --noEmit` in `mobile/` to confirm zero errors.

---

## Next action

Reassign back to implementer (🐺 Wolf / 🐝 Bee) to add the missing dependencies, push an additional commit, and move back to `in_review`.
