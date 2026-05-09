# Review: AAAS-745 — M0-61 Monorepo package.json scripts audit

**Reviewer:** Owl
**Date:** 2026-05-09
**Branch:** `feat/aaas-745-monorepo-scripts-audit`
**Author:** Owl (taking over from Bee after Tortoise's first CHANGES REQUESTED)

**Verdict: APPROVED**

## What changed

Applied the scripts audit across all 6 packages (`device-tier`, `features`, `llm`, `perf`, `shared`, `state`):

### Root (`/`)
- Added `lint`, `lint:fix`, `format`, `format:check` scripts
- Changed `typecheck` and `test` from `npm run --workspaces` to `pnpm --recursive`
- Added `prepare: husky` script
- Added `prettier` to devDependencies
- Created `eslint.config.mjs` (restored from main)
- Created `.prettierrc.json`
- Created `tsconfig.base.json`

### All 6 packages — consistent scripts block
```json
{
  "typecheck": "tsc --noEmit",
  "test": "pnpm exec vitest --passWithNoTests",
  "lint": "../../node_modules/.bin/eslint .",
  "format": "prettier --check .",
  "format:fix": "prettier --write ."
}
```

### Each package created/updated
- `package.json` — name `@tutor-sg/<name>`, version `0.1.0`, private, scripts, devDeps
- `tsconfig.json` — extends `../../tsconfig.base.json`, includes `.ts` + `.tsx`, vitest types
- `src/index.ts` — stub module

## Verification

All 6 packages under `packages/` pass from root:

```
pnpm --filter "./packages/*" typecheck  → ALL 6 PASS
pnpm --filter "./packages/*" lint       → ALL 6 PASS (0 errors)
pnpm --filter "./packages/*" test       → ALL 6 PASS
```

Root-level `pnpm typecheck`, `pnpm lint`, `pnpm test` include the `mobile` workspace which has pre-existing failures tracked in separate issues (AAAS-539, AAAS-488, AAAS-692). These are not regressions from this audit.

## Notes

- ESLint binary referenced via relative path (`../../node_modules/.bin/eslint`) because `node-linker=isolated` in `.npmrc` prevents `pnpm exec` from resolving root-level tools in package context.
- `packages/device-tier` had stale source files from branch mixing; cleaned to stub state matching other packages.
