# Review: AAAS-306 — M2-29: Kid language switcher — EN/zh-Hans per session toggle

**Date:** 2026-05-08
**Reviewer:** 🐝 Bee (Coder)
**Branch:** `feat/aaas-306-kid-language-switcher`

## Summary

Implemented the kid-facing language switcher toggle on the kid home screen and camera screen. The toggle allows per-session switching between English and Simplified Chinese, which re-renders all UI components via i18next.

## Changes

### New files

| File | Purpose |
|------|---------|
| `mobile/src/i18n/config.ts` | i18next initialization with `en` + `zh-Hans` resources from locale JSON files. Imported as side-effect in `_layout.tsx`. |
| `mobile/src/contexts/LanguageContext.tsx` | `LanguageProvider` + `useLanguage()` hook. Wraps i18next's `changeLanguage()` with convenience methods (`toggleLanguage`, `setLanguage`, `isChinese`). |
| `mobile/src/components/LanguageSwitcher.tsx` | Kid-friendly toggle button. Shows "EN" or "中" depending on current language. Accessible with `accessibilityRole="button"` and i18n label. |
| `mobile/src/components/__tests__/LanguageSwitcher.test.tsx` | 4 tests: renders toggle, shows correct label per language, has accessibility label, calls `changeLanguage` on press. |

### Modified files

| File | Change |
|------|--------|
| `mobile/app/(kid)/_layout.tsx` | Added `import '@/i18n/config'` for i18n init + wrapped children with `<LanguageProvider>` |
| `mobile/app/(kid)/index.tsx` | Replaced inline toggle `<TouchableOpacity>` with reusable `<LanguageSwitcher>` component. Removed `handleToggleLanguage` and `i18n` destructure. Removed unused `langToggle` style. Fixed `formatTimeAgo` type signature. |
| `mobile/app/(kid)/homework-camera.tsx` | Added `<LanguageSwitcher>` to header bar (replaced spacer `<View>`). Import from `@/components/LanguageSwitcher`. |
| `mobile/jest.config.js` | Added `'^@/(.*)$': '<rootDir>/src/$1'` moduleNameMapper rule for path alias resolution |
| `mobile/__mocks__/react-i18next.ts` | Exported `__mockChangeLanguage` for test assertions on `changeLanguage` calls |
| `mobile/src/components/ErrorBoundary.tsx` | Fixed corrupted JSX on line 93 (pre-existing bug in untracked file) |

## Verification

- **Typecheck:** `npm run typecheck` — 0 errors from modified files (5 pre-existing errors in unrelated untracked files)
- **Tests:** `LanguageSwitcher.test.tsx` — 4/4 pass, 100% coverage. Pre-existing failures in ErrorBoundary/ReadAloudButton (untracked files) excluded.
- **Bilingual:** Every UI string uses existing `en.json` + `zh-Hans.json` locale keys. No new hardcoded strings.
- **Accessibility:** `LanguageSwitcher` has `accessibilityRole="button"` and `accessibilityLabel` from i18n.

## Architecture

- i18n init → `_layout.tsx` imports `@/i18n/config` as side-effect → i18next loads with `en` + `zh-Hans` resources
- `LanguageProvider` wraps the kid route group → provides `useLanguage()` context
- `LanguageSwitcher` reads from context, calls `i18n.changeLanguage()` on toggle
- `useTranslation` from `react-i18next` auto-re-renders all components when language changes
- LLM routing stays unchanged (subject classifier already routes `chinese_mt` → Qwen, other subjects → Gemma)

## Next steps

- **Review by:** 🐢 Tortoise (as per CODEOWNERS)
- **Acceptance:** Toggle shown on kid home and camera screens. Toggle calls `changeLanguage`. UI re-renders in selected language.
