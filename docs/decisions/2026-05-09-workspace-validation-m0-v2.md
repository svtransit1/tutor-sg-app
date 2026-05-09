# AAAS-735: pnpm workspace validation — all packages build clean

Branch: `feat/aaas-735-pnpm-workspace-validation-v3`

## Changes

- On `main` base, created 8 `@tutor-sg/*` workspace packages:
  - **device-tier**: device detection, persistence, types, mocks, 34 tests
  - **features**: feature gate definitions, 4 tests
  - **llm**: routing, classifier, templates, 71 tests
  - **shared**: config/env, models/registry, schema, i18n keys, 52 tests
  - **database, i18n, perf, theme**: placeholder scaffolds

Added supporting infrastructure:
- `pnpm-workspace.yaml` — workspace definition
- `tsconfig.base.json` — shared TypeScript config
- Root `build` script (`pnpm --recursive typecheck`)

Fixes applied:
- `workspace:*` protocol for cross-package deps (pnpm)
- `@types/node` in shared (for `process.env`)
- `llm/tsconfig.json` extends `tsconfig.base.json`
- `device-tier/__mocks__/expo-sqlite.ts` — `__getMockDb(): any`
- `shared/__tests__` — type fixes (gemma-4, modelId)

## Verification

```
pnpm build  → 8/8 packages  ✓  (exit 0)
pnpm test   → 161 tests, 0 failures  ✓  (exit 0)
pnpm install → 9/9 workspace projects  ✓
```
