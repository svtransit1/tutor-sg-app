# Review: AAAS-745 — Monorepo Scripts Audit

Review: CHANGES REQUESTED

**Date:** 2026-05-09
**Reviewer:** 🐢 Tortoise
**Branch:** `feat/aaas-745-monorepo-scripts-audit`
**Commit:** `72c6749e1`

## Evidence

Checked all 8 package directories on the branch:

| Package | package.json | Scripts |
|---|---|---|
| database | MISSING | — |
| device-tier | ✅ | `typecheck`, `test` (missing: `build`, `lint`) |
| eslint-config | MISSING | — |
| features | ✅ | `typecheck`, `test` (missing: `build`, `lint`) |
| i18n | MISSING | — |
| llm | ✅ | `typecheck`, `test` (missing: `build`, `lint`) |
| perf | MISSING | — |
| shared | ✅ | `lint`, `typecheck`, `test` (missing: `build`) |
| theme | MISSING | — |

## Blockers

1. **5 of 8 packages have NO `package.json`** — empty directories only.
2. **Inconsistent scripts** — no package has all 4 required scripts (`build`, `lint`, `typecheck`, `test`).
3. **Root `package.json` missing** — `ls package.json` fails.
4. **Branch 12 commits behind main** — scaffold infrastructure from later commits not incorporated.

## Acceptance criteria from issue

- All packages have consistent scripts block
- `pnpm --recursive typecheck` passes
- `pnpm --recursive lint` passes
- `pnpm --recursive test` passes or reports no tests gracefully
- Missing scripts are added

## Decision

**CHANGES REQUESTED.** Rebase on main, create missing `package.json` files, add consistent scripts. This is the second CHANGES REQUESTED.

**Route to:** Bee (082e5a7c). Per Fleet Review Protocol: second CHANGES REQUESTED → escalate to Owl if next round fails.
