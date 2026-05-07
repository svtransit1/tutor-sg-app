# Vitest + RNTL + Detox Testing Scaffold

**Date:** 2026-05-07
**Author:** Bee (Mobile Coder #2)
**Issue:** AAAS-290 M0-3

## Architecture

### Vitest for unit/component tests

`mobile/` uses Vitest 4.1.5 as the primary test runner with `@testing-library/react-native` (RNTL) 13.3.3.

**Key technical decision:** React Native 0.81 uses Flow syntax (`import typeof`) in its entry point, which Node 25's ESM → CJS bridge cannot parse when RNTL's CJS code does `require('react-native')`. To work around this, the vitest config uses `deps.inline: ['react-native']` with `fallbackCJS: true`. This forces Vite to process react-native through its transform pipeline (which respects `resolve.alias` → CJS mock at `__mocks__/react-native.cjs`) instead of leaving it as an external that Node.js would try to parse natively.

**Trade-off:** The CJS mock provides only the component surface area used by the app (View, Text, etc.). If a test needs unreproduced RN internals, the mock must be extended. This is preferable to the alternative — patching react-native in the pnpm store — which breaks Jest's `preset: 'react-native'`.

### Jest retained for backward compatibility

Existing tests use Jest. The `test` npm script preserves this. Migration path: rename `.test.ts` → `.vitest.ts` and adopt Vitest conventions (`vi.fn` → `vi.fn`, `vi.mock` → `vi.mock`).

### Detox scaffold

A Detox configuration file (`.detoxrc.cjs`) and sample E2E test (`e2e/smoke.test.js`) are in place. Actual E2E tests require a running iOS/Android build and are run separately.

## File layout

| Path | Purpose |
|---|---|
| `mobile/vitest.config.mjs` | Vitest config for RN/Expo |
| `mobile/setup-jest.vitest.ts` | Global polyfills (no Module._resolveFilename hook needed) |
| `mobile/__mocks__/react-native.cjs` | CJS mock for react-native |
| `mobile/src/__tests__/vitest-hello.vitest.tsx` | Vitest sample test (4 tests: 3 pure logic + 1 RNTL) |
| `packages/*/vitest.config.ts` | Package-level Vitest configs |
| `packages/shared/__tests__/vitest-hello.vitest.ts` | Shared package sample test |
| `packages/device-tier/__tests__/vitest-hello.vitest.ts` | Device-tier package sample test |
| `packages/features/__tests__/vitest-hello.vitest.ts` | Features package sample test |
| `packages/llm/__tests__/vitest-hello.vitest.ts` | LLM package sample test |
| `mobile/.detoxrc.cjs` | Detox E2E configuration |
| `mobile/e2e/smoke.test.js` | Sample E2E smoke test |

## Running tests

```bash
# Vitest (mobile)
cd mobile && pnpm test:vitest

# Jest (legacy — auto-run by pnpm test at root)
cd mobile && pnpm test

# All package vitest suites
pnpm -r --filter='./packages/*' test

# E2E Detox (requires build — Xcode + iOS Simulator)
cd mobile && pnpm e2e:detox:build && pnpm e2e:detox:test

# E2E Maestro (simpler, works with expo go)
cd mobile && pnpm e2e
```

## Current test status (2026-05-07)

| Layer | Runner | Pass / Fail | Notes |
|---|---|---|---|
| Mobile unit | Vitest 4.1.5 | **4 / 0** | 3 pure logic + 1 RNTL render |
| Mobile legacy | Jest 29 | 76 / 1 | 1 pre-existing KidHomeScreen failure (unrelated) |
| packages/shared | Vitest 4.1.5 | **1 / 0** | |
| packages/device-tier | Vitest 4.1.5 | **1 / 0** | |
| packages/features | Vitest 4.1.5 | **1 / 0** | |
| packages/llm | Vitest 4.1.5 | **1 / 0** | |
| E2E (Detox) | Detox | — | Scaffold present; requires iOS build + Xcode |
| E2E (Maestro) | Maestro | — | Flows defined; requires simulator/device |
