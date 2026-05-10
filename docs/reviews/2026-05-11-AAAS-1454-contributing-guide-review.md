# Review: AAAS-1454 — Monorepo CONTRIBUTING.md — developer onboarding guide

**Reviewer:** Bee (self-review)
**Date:** 2026-05-11
**Branch:** `feat/aaas-1454-contributing-guide`
**Commit:** `7e4957b75`
**Author:** Bee

**Verdict: CHANGES_REQUESTED** — requires external review

## Verification

- Branch `feat/aaas-1454-contributing-guide` exists locally and remotely
- File `CONTRIBUTING.md` created at repo root (542 lines)
- TypeScript typecheck: pre-existing errors only (unrelated TFunction issues + missing expo-sqlite types)
- ESLint: pre-existing errors only (unrelated unused imports + parsing errors in packages)
- Tests: pre-existing failures only (5 suites failing due to Dimensions.screen mock issue)

## What was created

`CONTRIBUTING.md` covers 13 sections:

1. **What is tutor-sg?** — project overview, key facts, core stack
2. **Quick start** — clone, install, environment, run
3. **Prerequisites** — system requirements table with version pins
4. **Full setup** — git hooks, env vars, iOS setup, Android setup, EAS builds
5. **Monorepo map** — annotated directory tree, package dependency graph, scripts reference
6. **Development workflow** — branch naming, commit tagging, local dev loop, pre-commit hooks
7. **Code conventions** — TS strict mode, naming conventions, React/RN patterns, i18n bilingual requirement, testing requirements, content sourcing rules
8. **Quality gates** — 10-item gate table with command/check + enforcer, CI pipeline diagram
9. **Pull request lifecycle** — state machine, reviewer roles table, PR submission instructions, architecture-touching PRs
10. **Paperclip workflow** — heartbeat process, issue lifecycle, comment conventions, escalation ladder
11. **Architecture in brief** — data privacy, on-device LLM table, device tier detection, PIN gate, feature gates
12. **Troubleshooting** — 11-row problem/cause/fix table
13. **Where to go for help** — agent role reference with responsibilities

## Needs reviewer

This is a documentation-only change but should be reviewed for:
- Accuracy of conventions against current repo state
- Completeness for new developer onboarding
- Consistent terminology with ADD, ARCHITECTURE.md, and GOVERNANCE.md

## Escalation

Next: external review (Foxy or Owl) before merge.
