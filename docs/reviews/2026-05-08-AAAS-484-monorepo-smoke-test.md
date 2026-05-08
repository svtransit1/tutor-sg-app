Review: APPROVED

# AAAS-484: Monorepo integration smoke test

**Date:** 2026-05-08  
**Reviewer:** Owl  
**Branch:** `feat/aaas-484-monorepo-smoke-test`  
**Base:** commit `312ec266d` (AAAS-396: scaffold all 7 packages)

## Summary

Rebased the branch onto the complete package scaffolding commit (`312ec266d`). Applied root config fixes (tsconfig, eslint, prettier, smoke script). All smoke test steps pass for workspace packages.

## Evidence

### `pnpm install` — PASS
```
Done in 4s using pnpm v10.33.0
```
0 peer-dep warnings.

### `pnpm typecheck` — PASS (7/7 packages)

| Package         | Result |
|-----------------|--------|
| @tutor-sg/database    | PASS |
| @tutor-sg/device-tier | PASS |
| @tutor-sg/features    | PASS |
| @tutor-sg/i18n        | PASS |
| @tutor-sg/llm         | PASS |
| @tutor-sg/perf        | PASS |
| @tutor-sg/shared      | PASS |

### `pnpm lint` — PASS (0 errors)
1 warning: `no-undef` in `jest.config.js` (expected for CommonJS config).

### `pnpm test` — PASS (7/7 packages, 139/139 tests)

| Package         | Tests |
|-----------------|-------|
| @tutor-sg/database    | 1/1 |
| @tutor-sg/device-tier | 1/1 |
| @tutor-sg/features    | 1/1 |
| @tutor-sg/i18n        | 1/1 |
| @tutor-sg/llm         | 133/133 (4 suites) |
| @tutor-sg/perf        | 1/1 |
| @tutor-sg/shared      | 1/1 |

### `pnpm smoke` — PASS
Runs typecheck → lint → test in sequence.

## Changes Made

- **Branch:** Rebased to `312ec266d` (AAAS-396 scaffold) which has complete package scaffolding and root workspace config.
- **`tsconfig.base.json`:** Removed restrictive `"types": ["jest"]` field so non-jest packages don't error.
- **`package.json`:** Added `smoke` script, `eslint`, `@eslint/js`, `prettier` devDependencies, `format:check`/`format:write` scripts.
- **`eslint.config.mjs`:** Created flat config with recommended rules.

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| `pnpm install` succeeds clean (no peer-dep warnings) | PASS |
| `pnpm typecheck` passes across all packages | PASS |
| `pnpm lint` passes | PASS |
| `pnpm test` passes | PASS |
| Add root smoke script | DONE |
