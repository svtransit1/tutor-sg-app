# Vitest + RNTL + Detox Testing Scaffold

**Date:** 2026-05-07
**Author:** Bee (Mobile Coder #2)
**Issue:** AAAS-290 M0-3

## Architecture

### Vitest for unit/component tests

`mobile/` uses Vitest 4.1.5 as the primary test runner with `@testing-library/react-native` (RNTL) 13.3.3.

**Key technical decision:** React Native 0.81 uses Flow syntax (`import typeof`) in its entry point, which Vitest's Rolldown bundler cannot parse. To solve this without modifying the pnpm store, the setup file (`setup-jest.vitest.ts`) uses a `Module._resolveFilename` hook to redirect all `require('react-native')` calls to a lightweight CJS mock at `__mocks__/react-native.cjs`.

**Trade-off:** The CJS mock provides only the component surface area used by the app (View, Text, etc.). If a test needs unreproduced RN internals, the mock must be extended. This is preferable to the alternative — patching react-native in the pnpm store — which breaks Jest's `preset: 'react-native'`.

### Jest retained for backward compatibility

Existing tests use Jest. The `test:jest` npm script preserves this. Migration path: rename `.test.ts` → `.vitest.ts` and adopt Vitest conventions (`vi.fn` → `vi.fn`, `vi.mock` → `vi.mock`).

### Detox scaffold

A Detox configuration file (`.detoxrc.cjs`) and sample E2E test (`e2e/smoke.test.js`) are in place. Actual E2E tests require a running iOS/Android build and are run separately.

## File layout

| Path | Purpose |
|---|---|
| `mobile/vitest.config.mjs` | Vitest config for RN/Expo |
| `mobile/setup-jest.vitest.ts` | Global polyfills + module hook for RN mock |
| `mobile/__mocks__/react-native.cjs` | CJS mock for react-native |
| `mobile/src/__tests__/*.vitest.tsx` | Vitest sample test |
| `packages/*/vitest.config.ts` | Package-level Vitest configs |
| `mobile/.detoxrc.cjs` | Detox E2E configuration |
| `mobile/e2e/smoke.test.js` | Sample E2E smoke test |

## Running tests

```bash
# Vitest (primary)
cd mobile && pnpm test

# Jest (legacy)
cd mobile && pnpm test:jest

# Package tests
cd packages/device-tier && pnpm test

# E2E (requires build)
cd mobile && pnpm e2e:detox:build && pnpm e2e:detox:test
```
