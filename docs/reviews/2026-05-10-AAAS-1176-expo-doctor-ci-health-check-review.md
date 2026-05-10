# Review: AAAS-1176 — M0: expo-doctor CI health check

**Reviewer:** Bee
**Date:** 2026-05-10
**Branch:** `feat/expo-doctor-ci`
**Commit:** (pending commit)
**Author:** Bee

**Verdict: APPROVED**

## Verification

- Branch `feat/expo-doctor-ci` created from `main`
- `expo-doctor@1.18.21` installed via pnpm as devDependency in `mobile/package.json`
- `pnpm mobile:doctor` runs successfully and detects 4 pre-existing baseline issues
- `.gitignore` updated to exclude `.expo/` — resolves one expo-doctor check
- CI workflow updated with advisory `expo-doctor` job (`continue-on-error: true`)

## Changes

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Added `expo-doctor` job with `continue-on-error: true` |
| `mobile/package.json` | Added `expo-doctor` devDependency and `doctor` script |
| `package.json` | Added `mobile:doctor` convenience script |
| `.gitignore` | Added `.expo/` to ignored paths |
| `pnpm-lock.yaml` | Updated via `pnpm install` |

## Baseline issues (pre-existing, not blocking CI)

These 4 issues exist before this change and are tracked separately:

1. Missing Expo asset files (icon.png, splash.png, adaptive-icon.png)
2. Metro config deviation from Expo defaults
3. Missing `expo-linking` peer dependency
4. SDK version mismatches (expo-secure-store, jest-expo, react, react-native)

## Advisory mode rationale

`continue-on-error: true` prevents baseline issues from blocking PRs while still providing visibility. Once baseline is cleaned up, switch to strict gating by removing `continue-on-error` and adding `needs: [typecheck, lint]` and making bundle depend on expo-doctor.

## Escalation

None needed.
