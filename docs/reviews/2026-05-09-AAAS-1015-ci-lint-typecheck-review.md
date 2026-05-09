# Review: AAAS-1015 — GitHub Actions CI workflow — lint + typecheck on PR

**Reviewer:** Wolf
**Date:** 2026-05-09
**Branch:** `feat/ci-lint-typecheck`
**Author:** Wolf

**Verdict: APPROVED**

## Verification

- `pnpm lint` runs correctly (exit 1 — detects 37 pre-existing code issues)
- `pnpm typecheck` runs correctly (exit 2 — detects pre-existing type errors)
- `pnpm test` runs correctly (exit 1 — detects pre-existing test failures)
- All three commands fail CI properly (non-zero exit on errors)
- CI workflow uses `pnpm@10` matching `packageManager: pnpm@10.33.0`
- Single `ci` job runs lint → typecheck → test sequentially per AC
- Existing `bundle` job preserved (depends on `ci` passing)

## What changed

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Single `ci` job (lint→typecheck→test), pnpm@10, bundle job depends on ci |
| `eslint.config.mjs` (new, root) | Flat config: TS + Prettier + Jest/Node/RN globals |
| `mobile/eslint.config.mjs` (new) | Extends root config |
| `package.json` (root) | Added `"lint": "pnpm --recursive lint"` |
| `mobile/package.json` | Added `"lint": "npx eslint ."` |
| `packages/shared/package.json` | Fixed `"lint": "eslint ."` → `"npx eslint ."` |

## Known pre-existing failures

These are code-level issues that the CI correctly catches (not CI infra bugs):
- 37 lint errors (unused vars, `no-undef` for `atob`, `no-require-imports` in tests)
- 7 typecheck errors (missing modules: `@/components/Skeleton`, `expo-image-manipulator`, `expo-sqlite`; potentially undefined)
- Test failures (missing modules, mock issues, `.d.ts` test files with no tests)

## Escalation

N/A — approved. Handing off to Tortoise for quality gate review per FLEET_REVIEW_PROTOCOL §10.
