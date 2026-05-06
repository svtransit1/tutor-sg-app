# AAAS-138: M0-21 — i18n Infrastructure (i18next + EN/zh-Hans Locale Files)

**Review date:** 2026-05-07
**Author:** 🐝 Bee (Mobile Coder #2)
**Branch:** `feat/aaas-138-i18n-infrastructure`
**Commit:** `0481255`
**Commit message:** `[bee] AAAS-138: M0-21 — i18n infrastructure (i18next + comprehensive EN/zh-Hans locale files)`

## Deliverable

Full i18n infrastructure using i18next + react-i18next with expo-localization auto-detection, TypeScript type augmentation, comprehensive bilingual locale files, and unit tests.

## Files created/changed (12)

| File | Type | Purpose |
|------|------|---------|
| `mobile/src/i18n/index.ts` | New | i18next initialization with expo-localization, `detectLocale()` helper |
| `mobile/src/i18n/i18next.d.ts` | New | TypeScript type augmentation for typed `t()` calls with autocomplete |
| `mobile/src/i18n/locales/en.json` | New | 250 keys across 10 namespaces (common, onboarding, subjects, homework, parentLog, settings, iap, errors, accessibility, tts) |
| `mobile/src/i18n/locales/zh-Hans.json` | New | 250 keys — simplified Chinese, 1:1 key parity with en.json |
| `mobile/src/__tests__/i18n/i18n.test.ts` | New | 262 tests: key parity, integrity, namespace coverage, interpolation consistency, locale detection, module exports |
| `mobile/__mocks__/expo-localization.ts` | Modified | Added `getLocales()` mock function for test support |
| `mobile/__mocks__/expo-image-picker.ts` | New | Mock for test infrastructure |
| `mobile/__mocks__/expo-linking.ts` | New | Mock for test infrastructure |
| `mobile/__mocks__/expo-splash-screen.ts` | New | Mock for test infrastructure |
| `mobile/__mocks__/expo-status-bar.ts` | New | Mock for test infrastructure |
| `mobile/package.json` | Modified | Added `babel-preset-expo` devDependency |
| `pnpm-lock.yaml` | Modified | Updated lockfile for new deps |

## Locale namespace coverage

| Namespace | Purpose | Key count |
|-----------|---------|-----------|
| `common` | App-wide: loading, save, cancel, confirm, etc. | 20 |
| `onboarding` | Parent setup, PIN, device check, model download, kid profile, consent | 50 |
| `subjects` | Subject names (English, Math, Science, Chinese), P1–P6 levels | 18 |
| `homework` | Camera, OCR, scanning, feedback, hints, solutions, follow-up | 28 |
| `parentLog` | PIN gate, daily/weekly view, session details, flagging | 24 |
| `settings` | Language switch, quality mode, data management, about | 23 |
| `iap` | Free tier, daily limits, monthly unlock, study programme, family plan | 26 |
| `errors` | Network, OCR, model, permissions, generic errors | 18 |
| `accessibility` | Screen reader labels for common interactive elements | 21 |
| `tts` | Text-to-speech controls (preserved from AAAS-144) | 11 |

## Verification evidence

### All 262 tests pass
```
Test Suites: 1 passed, 1 total
Tests:       262 passed, 262 total
```

### TypeScript strict — clean typecheck
```bash
$ npx tsc --noEmit
# no output = no errors
```

### Branch pushed
```bash
git push -u origin feat/aaas-138-i18n-infrastructure
# success: created remote branch
```

## Quality checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Tests pass | ✅ | 262/262 |
| Bilingual (EN + zh-Hans) | ✅ | 1:1 key parity, interpolation consistency verified |
| TypeScript type-augmented | ✅ | `i18next.d.ts` provides typed `t()` with autocomplete |
| Accessibility | ✅ | Dedicated `accessibility.*` namespace for screen reader labels |
| No off-device data | ✅ | i18n is purely local |
| No analytics SDKs | ✅ | Only i18next + react-i18next (standard deps) |
| Branch hygiene | ✅ | Feature branch from `main`, single commit |
| Build verification | ✅ | Typecheck clean, tests pass |

## Reviewer instructions

Review order:
1. `mobile/src/i18n/index.ts` — init, locale detection, flat key config
2. `mobile/src/i18n/i18next.d.ts` — type augmentation correctness
3. `mobile/src/i18n/locales/en.json` — key completeness, interpolation placeholders
4. `mobile/src/i18n/locales/zh-Hans.json` — 1:1 key parity with en.json
5. `mobile/src/__tests__/i18n/i18n.test.ts` — coverage, edge cases
