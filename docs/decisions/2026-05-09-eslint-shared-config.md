# ESLint Shared Config — Monorepo Pattern

**Date:** 2026-05-09
**Issue:** AAAS-794 / M0-74
**Owner:** Bee

## Decision

The monorepo uses a `@tutor-sg/eslint-config` workspace package (at `packages/eslint-config/`) as the single source of truth for ESLint rules.

## Pattern

- `packages/eslint-config/index.mjs` exports a flat config array via `tseslint.config()`
- Each workspace package has its own `eslint.config.js` that imports from `@tutor-sg/eslint-config`
- TypeScript-only packages use the shared config directly
- Packages with JSX (mobile) extend it with React/RN-specific plugins
- Root `eslint.config.js` exists as a pass-through for future root-level lint needs

## Rules

- TypeScript strict mode (via `typescript-eslint`)
- `no-console` → warn (allow warn/error)
- `@typescript-eslint/no-unused-vars` → error (allow `_` prefix)
- `@typescript-eslint/no-explicit-any` → warn
- `@typescript-eslint/consistent-type-definitions` → error (prefer `interface`)
- Test/mock files get relaxed rules (unused-vars off, any off, no-undef off)
- eslint-config-prettier integrated (Prettier handles formatting)

## Running

```sh
pnpm lint              # all packages
pnpm --filter <name> lint  # single package
```
