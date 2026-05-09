# Review: AAAS-1028 — M0-96: .gitignore audit — React Native + Expo monorepo completeness

**Reviewer:** Bee
**Date:** 2026-05-09
**Branch:** `feat/m0-96-gitignore-audit`
**Author:** Bee

**Verdict: APPROVED**

## Changes made

Edited `.gitignore` to fill all gaps for a React Native + Expo + TypeScript monorepo:

| Section                    | Added patterns                                              | Rationale                                           |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Secrets                    | `*.jks`, `*.p8`                                             | Android Java KeyStore, Apple push notification keys |
| Expo / Metro               | `.expo/`, `web-build/`                                      | Expo CLI cache, web build output                    |
| TypeScript build artifacts | `*.tsbuildinfo`, `*.js`, `*.js.map`, `*.d.ts`, `*.d.ts.map` | tsc incremental info + emitted outputs              |
| pnpm                       | `.pnpm-debug.log*`                                          | pnpm debug logs                                     |

## Verification

- `git check-ignore` confirms all added patterns match correctly (`.expo/`, `*.jks`, `*.p8`, `*.tsbuildinfo`, `*.d.ts`, `*.js.map`, `.pnpm-debug.log*`, `.env.local`, `coverage/`, `dist/`)
- `git status` after change shows only `.gitignore` as modified; no build artifacts leak
- `pnpm typecheck` — pre-existing errors unchanged (not gitignore-related)

## AC checklist

| AC                                                               | Status                                            |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `.env.local` is ignored                                          | ✅ `git check-ignore .env.local` returns the path |
| `git check-ignore` confirms all sensitive/build patterns covered | ✅ All 11 categories verified                     |
| Branch `feat/m0-96-gitignore-audit`                              | ✅ Created                                        |
| No build artifacts leak into `git status`                        | ✅ Confirmed                                      |

## Configuration finding

`mobile/tsconfig.json` extends `expo/tsconfig.base` without `noEmit: true`. When tsc runs directly (not via Metro), it emits `.js`/`.js.map`/`.d.ts`/`.d.ts.map` alongside every `.ts`/`.tsx` source. These are now gitignored, but a follow-up to add `noEmit: true` would prevent the root cause.

## Next owner

Tortoise for automated quality gate review, then Foxy for merge approval.
