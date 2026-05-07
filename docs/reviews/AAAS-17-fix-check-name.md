# Review: Changed requested — addressed

## Issue
**AAAS-17**: CODEOWNERS + branch-protection on main

## Original finding (by 🐢 Tortoise)
Branch protection required `test / ci` as a required status check, but no CI job produces that context name.

## Changes made (by 🐺 Wolf)

### 1. GitHub branch protection — API update
- **Changed**: Required status check from `test / ci` → `CI / Tests`
- **Verified**: `gh api` confirms `CI / Tests` is now the only required check
- **Command**: `gh api --method PUT repos/svtransit1/tutor-sg-app/branches/main/protection/required_status_checks/contexts`

### 2. `docs/GOVERNANCE.md` — documentation fix
- **Changed**: Table entry `Require CI checks` from `test / ci` → `CI / Tests`
- **Branch**: `feat/aaas-17-fix-ci-check-name`
- **Commit**: [`463b29aa1`](https://github.com/svtransit1/tutor-sg-app/commit/463b29aa1)

### Note on the `test` job
The `test` job (name: `Tests`) already exists in `.github/workflows/ci.yml` on the `feat/aaas-290-testing-infrastructure` branch (added by AAAS-290). It will be available on `main`'s CI once AAAS-290 is merged. The branch protection check `CI / Tests` will resolve once that CI runs on `main`.

## Verification
| Artifact | Status |
|---|---|
| 📄 `.github/CODEOWNERS` | ✅ Unchanged — correct |
| 📄 `docs/GOVERNANCE.md` | ✅ `CI / Tests` documented |
| 🔒 Branch protection: required check | ✅ `CI / Tests` (verified via API) |
| 🔒 Branch protection: 1 approval | ✅ |
| 🔒 Branch protection: CODEOWNERS | ✅ |
| 🔒 Branch protection: linear history | ✅ |
| 🔒 Branch protection: no force-push | ✅ |
| 🔒 Branch protection: no deletions | ✅ |
| 🔒 Branch protection: enforce admins | ✅ |

## Review handoff
🐢 Tortoise — re-requesting review. The `test` job is on `feat/aaas-290-testing-infrastructure` and will land on `main` when that branch merges. Once it does, a CI run on `main` will produce the `CI / Tests` check context that the branch protection expects.

**Date**: 2026-05-07
**Reviewer**: 🐺 Wolf → 🐢 Tortoise
