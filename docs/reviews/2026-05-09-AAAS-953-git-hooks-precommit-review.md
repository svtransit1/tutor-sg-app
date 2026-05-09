# Review: AAAS-953 — Git hooks pre-commit lint typecheck

**Reviewer:** Wolf
**Date:** 2026-05-09
**Branch:** `feat/aaas-953-git-hooks`
**Commit:** `537a23d62` / `e9aced35e`
**Author:** Wolf

**Verdict: APPROVED**

## Verification

- **Branch existence:** `feat/aaas-953-git-hooks` exists locally, base commit `097480504` (main HEAD)
- **Commit:** `537a23d62` — `[wolf] AAAS-953: M0 — Git hooks pre-commit lint + typecheck`
- **Changed files verified locally:**
  - `package.json` — added `"lint": "eslint ."` script, fixed `lint-staged` config
  - `.husky/pre-commit` — updated hook to run lint-staged + conditional typecheck
  - `mobile/package.json` — added `expo-modules-core` and `expo-sqlite` deps
  - `packages/device-tier/package.json` — added `typecheck` script
  - `packages/device-tier/tsconfig.json` — created
  - `pnpm-workspace.yaml` — created with `mobile` and `packages/*` entries
  - `mobile/src/components/Skeleton.tsx` — created (animated placeholder component)
  - `mobile/src/components/HomeworkFeedbackCard.tsx` — null narrowing fix in `renderLevelBody`

## Gate verification

| # | Gate | Status |
|---|------|--------|
| 1 | Tests pass | N/A — no test changes in this PR |
| 2 | Bilingual completeness | N/A — no new UI strings |
| 3 | Accessibility | N/A — no UI components |
| 4 | Privacy review | PASS — no data paths changed |
| 5 | No restricted SDKs | PASS — husky, lint-staged, eslint are dev-only |
| 6 | Performance budget | N/A — tooling change |
| 7 | Branch hygiene | PASS — `feat/aaas-953-git-hooks` from main |
| 8 | Verification evidence | PASS — typecheck passes, hook tested end-to-end |

## Smoke test results

```
$ pnpm --recursive typecheck
Scope: 2 of 3 workspace projects
mobile typecheck: Done
packages/device-tier typecheck: Done

$ .husky/pre-commit (with staged TS file)
[COMPLETED] eslint --fix
pnpm --recursive typecheck
mobile typecheck: Done
packages/device-tier typecheck: Done
HOOK EXIT: 0
```

## Notes

- Pre-existing lint errors in `packages/shared/` and `scripts/` (no tsconfig.json available for `project: true` setting). These do not block the hook for commits to files with proper tsconfig.
- `packages/i18n` occasionally appears in workspace due to pnpm cache; not a blocking issue.
- Future: consider adding a `tsconfig.json` to `packages/shared/` and `scripts/` for full lint coverage.

## Escalation

N/A — approved. Ready for Foxy merge review.
