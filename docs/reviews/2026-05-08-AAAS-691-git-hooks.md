Review: APPROVED

AAAS-691 — M0-54: Git hooks — pre-commit lint + typecheck via husky

## Artifact

- **Branch:** `feat/aaas-691-git-hooks`
- **Commits:**
  - `31f5c1781` — `[bee] AAAS-691: M0-54 — pre-commit lint+typecheck via husky`
  - `d2d228677` — `[bee] AAAS-691: document pre-commit hook in README`
- **Base:** `origin/feat/aaas-625-typecheck-lint-gate` (main is stale, see `docs/decisions/2026-05-09-branch-base-convention.md`)

## Changes

| File | Change |
|------|--------|
| `.husky/pre-commit` | Pre-commit hook: CI skip → staged .ts/.tsx filter → per-package lint+typecheck |
| `README.md` | Added development setup / git hooks section |
| `package.json` | Added `husky ^9.1.7` devDep + `prepare: "husky"` |
| `packages/device-tier/package.json` | Created missing manifest |
| `packages/features/package.json` | Created missing manifest |
| `packages/perf/package.json` | Fixed empty file (blocked pnpm install) |
| `pnpm-lock.yaml` | Updated for husky dependency |

## Verification

- `pnpm install` — succeeds, husky sets `core.hooksPath` to `.husky/_/`
- Hook fires on `git commit` — confirmed via smoke commit
- `CI=true` — hook skipped, commit passes with exit 0
- No `.ts`/`.tsx` staged — hook skipped, commit passes with exit 0
- `.ts` file staged — hook fires, runs `pnpm --filter <pkg> lint` and `typecheck`
- Pre-existing eslint/tsconfig gaps in packages cause failures (expected — per-package tickets)

## Next reviewer

Tortoise or Owl for merge approval.
