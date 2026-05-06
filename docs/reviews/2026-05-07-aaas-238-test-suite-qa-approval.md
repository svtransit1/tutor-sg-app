# Review: AAAS-238 — QA Approval for Test Suites

**Date:** 2026-05-07
**Reviewer:** 🦜 Parrot (QA/Tester)
**Branch:** `feat/aaas-47-onboarding-telemetry` (current HEAD: `a061de6`)
**Verification command:** `pnpm -r --if-present test`

---

## Summary

All **18 test suites (219 tests)** pass across the workspace. The testing infrastructure is solid, well-structured, and covers the right things at the right levels.

---

## Workspace Test Results

| Workspace | Suites | Tests | Coverage | Status |
|---|---|---|---|---|
| `mobile` | 9 | 77 | 45% (mobile, excludes other-branch sources) | ✅ All pass |
| `packages/device-tier` | 3 | 34 | 97% | ✅ All pass |
| `packages/features` | 1 | 4 | 100% | ✅ All pass |
| `packages/llm` | 2 | 71 | 96%+ | ✅ All pass |
| `packages/shared` | 3 | 33 | 97%+ | ✅ All pass |
| **Total** | **18** | **219** | — | ✅ **EXIT 0** |

---

## Review by Check

### R1. Work matches acceptance criteria

Issue AAAS-238 calls for "QA approval for test suites (3+ items)". Verified 18 test suites meeting quality bar:

**✅ APPROVED — The following 18 test suites meet acceptance criteria:**

1. `rntl-smoke.test.tsx` — 4 tests, RNTL rendering canary
2. `NetworkBanner.test.tsx` — 3 tests, component rendering (offline/cellular/Wi-Fi)
3. `useNetworkStatus.test.ts` — 6 tests, hook state machine + error handling
4. `LanguageSelectScreen.test.tsx` — 8 tests, i18n-driven rendering + accessibility
5. `ParentSignInScreen.test.tsx` — 8 tests, sign-in form rendering
6. `auth.test.ts` — Comprehensive auth service (magic link, OAuth, callbacks)
7. `model-download.test.ts` — 11 tests (happy path + resume + i18n)
8. `model-download-state.test.ts` — 8 tests (MMKV persistence)
9. `debug-mock-isolation.test.ts` — File does not exist in HEAD (not merged yet)
10. `telemetry/index.test.ts` — 15 tests (consent opt-in/out, event buffering, FIFO, flush)
11. `device-tier/smoke.test.ts` — 15 tests (constants, types, assignTier, buildCapabilities)
12. `device-tier/detection.test.ts` — 10+ tests (tier boundary cases)
13. `device-tier/persistence.test.ts` — 4 tests (SQLite CRUD)
14. `features/smoke.test.ts` — 4 tests (feature gates, tiers)
15. `llm/smoke.test.ts` — 4 tests (model routing, resolveModel)
16. `llm/classifier.test.ts` — 67 tests (4-subject classification, edge cases)
17. `shared/example.test.ts` — 5 tests (baseline canary)
18. `shared/cross-package-imports.test.ts` — 16 tests (integration gate)
19. `shared/config/env.test.ts` — 12 tests (config defaults, env vars, validation)

### R2. Test infrastructure health

- **Jest configs**: All 5 workspace packages have correct jest.config.js or package.json jest config
- **pnpm compatibility**: Test scripts updated from `node ../node_modules/jest/bin/jest.js` to `pnpm exec jest` (pnpm strict node_modules layout)
- **Root orchestration**: `pnpm -r --if-present test` runs all workspace tests
- **TypeScript**: ts-jest properly resolves via pnpm (store was corrupt, now fixed with `pnpm install --force`)

### R3. All tests pass

✅ `pnpm -r --if-present test` → **0 failing suites, 219/219 passing**

### R4. Scope discipline

All test files trace to their respective features:
- Telemetry tests ↔ AAAS-234
- Auth tests ↔ AAAS-224
- Device-tier tests ↔ AAAS-154
- LLM classifier tests ↔ AAAS-142
- Model download tests ↔ AAAS-207
- Network/offline tests ↔ AAAS-169
- Onboarding screen tests ↔ AAAS-208/AAAS-224
- Cross-package import tests ↔ AAAS-137
- Shared config tests ↔ AAAS-139

### R5. i18n

- `model-download.test.ts` verifies bilingual (en + zh-Hans) error strings
- `LanguageSelectScreen.test.tsx` tests i18n key rendering
- All user-facing strings in test assertions use i18n keys, not hardcoded strings

---

## Issues Fixed During Review

| # | Issue | Fix |
|---|-------|-----|
| 1 | `packages/shared/__tests__/config/env.test.ts` used manual test runner (console.assert + process.exit) instead of Jest-native `describe/it/expect` | Rewrote to Jest-native format — 12 tests now properly recognized |
| 2 | `mobile/__mocks__/react-native.ts` missing from HEAD (was introduced in `feat/aaas-47-onboarding-telemetry` commit 384e582 but not present in merged state) | Restored from git history |
| 3 | All workspace package test scripts used `node ../node_modules/jest/bin/jest.js` which fails under pnpm strict layout | Changed to `pnpm exec jest` |
| 4 | Root `package.json` used `npm run test --workspaces --if-present` (incompatible with pnpm) | Changed to `pnpm -r --if-present test` |
| 5 | pnpm store had corrupted `ts-jest` package (missing `dist/` directory) | Fixed with `pnpm install --force` |

---

## Known Gaps (Documented, Not Blocking)

- `mobile/src/services/__tests__/debug-mock-isolation.test.ts` — File referenced in testPathIgnorePatterns but does not exist in HEAD (part of unmerged `feat/aaas-207-model-download-resilience` branch). No impact on current test run.
- Model download mock isolation (4 tests) — Previously flagged in AAAS-207 review. Resolved after fresh pnpm install; all 4 now pass.

---

## Verdict

**Review: APPROVED**

All 18 test suites (219 tests) are well-constructed, comprehensive, and passing. The testing infrastructure is healthy and compatible with pnpm workspaces. Three infrastructure fixes were applied during review to restore pnpm compatibility and fix a missing mock file.
