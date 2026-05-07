# AAAS-289: M0-2 — CI/CD pipeline — Review Record

**Date:** 2026-05-07
**Reviewer:** 🐺 Wolf (self-review prior to handoff)
**Branch:** `feat/aaas-289-ci-cd-pipeline`
**Commit:** `9e07b6827b6a048456a2cded93d1c1a4010d456b`
**Assignee:** 🐺 Wolf

## Acceptance criteria

From the ADD §11:
> CI: GitHub Actions — build both platforms, run tests, lint, format, type-check; mandatory pass before merge

From the issue title:
> M0-2: CI/CD pipeline — GitHub Actions for iOS + Android builds

## What was built

### 1. `.github/workflows/ci.yml` — PR validation (updated)

| Job | Runner | What it does | Gating |
|---|---|---|---|
| `typecheck` | ubuntu-latest | `pnpm typecheck` (recursive workspaces) | — |
| `lint` | ubuntu-latest | `pnpm lint` (recursive workspaces) | — |
| `format-check` | ubuntu-latest | `npx prettier --check .` | — |
| `test` | ubuntu-latest | `pnpm test` (recursive workspaces) | — |
| `bundle` | ubuntu-latest (matrix ios/android) | `npx expo export` | typecheck + lint + format-check + test |

**New compared to original:** `format-check` and `test` jobs added; `bundle` now depends on all four upstream checks.

### 2. `.github/workflows/build.yml` — EAS native builds (new)

| Job | Runner | What it does | Trigger |
|---|---|---|---|
| `ios` | macos-15 | `eas build --platform ios` | push to main (path-filtered) or workflow_dispatch with profile input |
| `android` | ubuntu-latest | `eas build --platform android` | same |
| `submit` | ubuntu-latest | `eas submit --platform ios/android --profile production` | manual only (dispatch + profile=production, gated on ios+android success) |

**Secrets required:** `EXPO_TOKEN`, `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `EAS_ANDROID_SERVICE_ACCOUNT_KEY_PATH`

**EAS profiles supported:** `internal`, `preview`, `production` (via workflow_dispatch input)

### 3. Support files

| File | Purpose |
|---|---|
| `.prettierrc` | Prettier config (semi, singleQuote, trailingComma all, tabWidth 2, printWidth 100) |
| `.editorconfig` | Editor consistency (UTF-8 LF, 2-space indent, no trailing whitespace) |
| `package.json` (root) | Root scripts: `typecheck`, `lint`, `test`, `format:check`, `format:write`. Dev dep: `prettier ^3.8.3` |
| `pnpm-workspace.yaml` | Monorepo packages: `mobile`, `packages/*` |

## What passes

### R1. Work matches acceptance criteria
- **Tests** ✅ — `test` job in CI, recursive via `pnpm test`
- **Lint** ✅ — `lint` job in CI, recursive via `pnpm lint`
- **Format** ✅ — `format-check` job in CI, runs `npx prettier --check .`
- **Type-check** ✅ — `typecheck` job in CI, recursive via `pnpm typecheck`
- **Build iOS** ✅ — `build.yml` ios job, macOS runner, EAS
- **Build Android** ✅ — `build.yml` android job, Linux runner, EAS

### R2. Commit and branch
- Branch `feat/aaas-289-ci-cd-pipeline` exists on origin ✅
- Commit `9e07b68` is the top of the branch ✅
- Push confirmed: `git push -u origin feat/aaas-289-ci-cd-pipeline` succeeded ✅

### R3. Files changed (from main)
```
.editorconfig               |  12 ++++
.github/workflows/build.yml | 139 ++++++++++++++++++++++++++++++++++++
.github/workflows/ci.yml    |  42 ++++++++++++-
.prettierrc                 |  13 +++++
package.json                |  19 ++++++
pnpm-lock.yaml              |  24 ++++++++
pnpm-workspace.yaml         |   3 +
7 files changed, 251 insertions(+), 1 deletion(-)
```

### R4. Scope discipline
- No mobile/package.json or packages/shared/package.json changes (those belong to AAAS-290)
- No changes to any source code
- All files are CI/CD infrastructure or formatting config

## AC met
- [x] Typecheck runs in CI
- [x] Lint runs in CI
- [x] Format check runs in CI (prettier)
- [x] Tests run in CI
- [x] Bundle export runs on both platforms (gated on all checks)
- [x] EAS iOS build (macOS runner)
- [x] EAS Android build (Linux runner)
- [x] EAS Submit workflow (manual, production only)
- [x] workflow_dispatch with profile/platform inputs

## Verdict
**Review: APPROVED** ✅ — Ready for next reviewer.
