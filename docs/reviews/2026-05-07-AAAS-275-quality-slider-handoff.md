# AAAS-275 — M2-20c: Settings UI quality slider for device tier override

**Status:** Ready for review
**Branch:** `feat/aaas-275-quality-slider`
**Commit:** `a7d475f35`
**Author:** Bee

## What changed

### New settings screen (`mobile/app/(parent)/settings.tsx`)
Replaced the placeholder text screen with a full interactive settings page containing:

- **AI Quality section** — 4-option pill selector: Auto / High Performance / Standard / Low
  - Reads existing override from SQLite on mount
  - Persists choice via `saveDeviceTier()` / `clearDeviceTier()`
  - Shows current effective tier status ("Auto-detected as..." or "Manually set to...")
  - Displays model info (LLM + Chinese MT model names) for the selected tier

- **Language section** — EN / 中文 toggle using `i18n.changeLanguage()`

- **Accessibility** — all interactive elements have `accessibilityRole`, `accessibilityLabel`, `accessibilityState`

### New persistence function (`packages/device-tier/src/persistence.ts`)
- `clearDeviceTier(db)` — deletes the override key, returning to auto-detection

### Updated exports (`packages/device-tier/src/index.ts`)
- Re-exports: `openDatabase`, `ensureSettingsTable`, `saveDeviceTier`, `loadDeviceTier`, `clearDeviceTier`
- Also exports: `BelowFloorModal` component

### New i18n keys
- **en.json** — 13 new keys under `parent.settings.*` for quality slider labels, tier status, language toggle, and footer
- **zh-Hans.json** — matching Simplified Chinese translations
- **`packages/shared/src/i18n/keys.ts`** — updated `ParentSettingsKey` type union and `I18N_KEYS` runtime array

### Updated dependencies
- `mobile/package.json` — added `@tutor-sg/device-tier: workspace:*`

## What was verified

- Device-tier persistence tests (3 suites, 34 tests) pass — but tested against a different lockfile state due to workspace resolution issues
- Typecheck passes on `@tutor-sg/shared` package
- `tsconfig.json` for device-tier updated with `jsx: "react-jsx"` and `src/**/*.tsx` include

## Who should review next

**Owl** — architecture review:
1. Verify the device-tier persistence export chain is consistent with the existing `buildCapabilities() / assignTier()` pattern
2. Confirm the settings screen's import of `@tutor-sg/device-tier` is the intended pattern for the monorepo

**Flutter** — UX review:
1. Verify pill-selector styling matches the parent-area design language
2. Confirm the header back-button pattern is consistent with other screens

## Branch

`feat/aaas-275-quality-slider` at `a7d475f35`
