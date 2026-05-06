# Design Tokens + ThemeProvider — Decision Record

**Date:** 2026-05-06
**Issue:** AAAS-294 (M0-9)
**Author:** 🦋 Flutter (UX/UI Designer)
**Status:** Locked (awaiting fleet review)

## Summary

Created `@tutor-sg/theme` — a reusable, fully-typed design token system and React context `ThemeProvider` for the tutor-sg app. Replaces the draft theme stub in `AAAS-163/app-entry-providers` branch.

## Architecture

### Token layer (pure, no React dependency)

All tokens are `as const` objects in `packages/theme/src/tokens/`:

| Token file | Contents |
|---|---|
| `colors.ts` | Full palette (50–900 scale per hue), `kidColors` (vibrant), `parentColors` (professional) |
| `typography.ts` | Font sizes (13–40pt), weights, line heights, composable `TextStyle` presets |
| `spacing.ts` | 8-pt grid (2–48px), content inset presets, minimum touch targets (44pt) |
| `borders.ts` | Border radius (4–9999px), border widths (hairline, thin, medium, thick) |
| `shadows.ts` | Platform-aware shadow presets using `elevation` (Android) or native shadow properties (iOS) |

### Provider layer (React context)

`ThemeProvider` wraps the app, provides the full `Theme` object via context. `useTheme()` hook for access. Supports `'kid'` and `'parent'` modes.

## Key decisions

### 1. Mode-driven color palette (not light/dark)

Instead of a generic light/dark colour scheme (as in the AAAS-163 stub), we use **mode**: `'kid'` vs `'parent'`. This maps directly to the product requirement: kids see vibrant playful colours; parents see professional calm colours. Dark mode support is deferred (the type `AppMode` extends `ThemeMode | 'dark'` for future use).

### 2. Separate package (`@tutor-sg/theme`)

Keeps design tokens decoupled from the mobile app entry point. Other packages (`device-tier`, `features`) can consume tokens without circular deps. Follows the monorepo pattern established by `@tutor-sg/device-tier`.

### 3. Kid-first typography

Body text at **17pt** (exceeds the ADD §9 minimum of 16pt). Uses system fonts only (SF Pro on iOS, Roboto on Android) — no custom font loading for v1.

### 4. 8-pt grid with 4-pt subgrid

Spacing uses a 4-pt subgrid within the 8-pt grid system to allow micro adjustments on small UI elements.

### 5. Subject accent colors

`kidColors` includes four subject-level accent colors (Math → blue, English → coral, Chinese → green, Science → purple) for use in subject tiles, worksheet headers, and progress widgets.

### 6. Platform-aware shadows

`shadows` module auto-detects the platform: uses `elevation` on Android and native shadow properties on iOS.

## What's NOT included (future issues)

- **Dark mode** — deferred; can be added by extending `ThemeMode` with `'dark'` and adding `darkKidColors`/`darkParentColors`
- **Custom fonts** — deferred to v2 or when brand identity is locked
- **Animation tokens** — no timing curves or motion presets yet
- **Component-specific theme variants** (e.g., button size variants, input focus states) — will be built per-component in feature packages

## Migration from AAAS-163 theme stub

The existing `mobile/src/theme/theme.tsx` draft (on branch `AAAS-163/app-entry-providers`) uses a simple `{colors: {background, text, primary, ...}}` shape. The `@tutor-sg/theme` package is a superset replacement. To migrate:

1. Replace `import { ThemeProvider, useTheme } from '../src/theme/theme'`
   → `import { ThemeProvider, useTheme } from '@tutor-sg/theme'`
2. Replace `mode: 'light' | 'dark'` → `initialMode: 'kid' | 'parent'`
3. Replace `theme.colors.background` → `theme.colors.background`
   (same key name, still available)
4. Add `theme.spacing`, `theme.typography`, etc. as needed

## Test coverage

- 22 unit tests across 2 test files
- Covers: ThemeProvider rendering, mode switching, useTheme error boundary, token hierarchy, color integrity, spacing consistency, ADD §9 compliance
