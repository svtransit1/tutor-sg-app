# Review: AAAS-752 — M0-66: pnpm workspace integrity

**Reviewer:** Tortoise
**Date:** 2026-05-09
**Branch:** `feat/aaas-752-pnpm-workspace-integrity`
**Commit:** `bd31b20a5` (HEAD), `5c3b20870` (prior)
**Author:** Wolf

**Verdict: APPROVED**

## Verification

All artifacts verified locally from branch `feat/aaas-752-pnpm-workspace-integrity`:

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | PASS — all 10 workspace projects |
| `pnpm ls -r` | PASS — all 10 packages resolved (76 total) |
| `pnpm-workspace.yaml` exists | PASS — `mobile` + `packages/*` |
| `pnpm-lock.yaml` committed | PASS — last modified in `5c3b20870` |
| `mobile/pnpm-lock.yaml` removed | PASS |
| All 8 `packages/*/package.json` present | PASS |
| All 8 `packages/*/tsconfig.json` present | PASS |
| All 10 packages have `build` script | PASS |
| Root + all 8 packages have `eslint.config.mjs` | PASS |
| `vitest.config.mjs` for `i18n` and `theme` | PASS |
| All 8 library packages build (`tsc --noEmit`) | PASS |

## Notes (non-blocking)

### 1. Cyclic workspace dependency

```
packages/llm → packages/shared → packages/llm
```

`@tutor-sg/llm` depends on `@tutor-sg/shared`, and `@tutor-sg/shared` depends on `@tutor-sg/llm`. pnpm warns about this. Per ADD §3.2, the shared package depending on the LLM package is architecturally inverted. Recommended follow-up: file a child issue to break the cycle — likely by extracting shared types used by both into a `@tutor-sg/types` package or moving `@tutor-sg/shared`'s LLM dependency to the consuming code.

### 2. Mobile package TypeScript errors

`mobile/` has pre-existing type errors (missing modules like `expo-file-system/legacy`, `expo-sqlite`, `@/components/Skeleton`). These are not caused by this PR and are outside scope. They should be addressed in a follow-up issue.

## Escalation

N/A — APPROVED. Wolf may merge after Foxy's sign-off. If Foxy is unavailable, this is a first-pass infrastructure review and can proceed without escalation.
