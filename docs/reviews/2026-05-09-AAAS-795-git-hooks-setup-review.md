# Review: AAAS-795 — M0-75: Git hooks setup via husky + lint-staged

**Reviewer:** Bee
**Date:** 2026-05-09
**Branch:** `feat/aaas-795-git-hooks`
**Commit:** `b9c29617c`
**Author:** Bee

**Verdict: APPROVED**

## Verification

- **Branch:** `feat/aaas-795-git-hooks` exists locally from `main`
- **Commit:** `b9c29617c` — "M0-75 — Git hooks setup via husky + lint-staged"
- **Husky init:** `pnpm prepare` ran, `core.hooksPath = .husky/_` set
- **Files changed:**
  - `package.json` — added `prepare: husky`, `lint-staged` config, devDependencies (husky, lint-staged, @eslint/js, eslint, typescript-eslint)
  - `eslint.config.mjs` — root ESLint flat config
  - `mobile/eslint.config.mjs` — mobile re-export of root config
  - `.husky/pre-commit` — `npx lint-staged` hook (executable)

## Quality gates

| Gate                  | Status | Evidence                                                                           |
| --------------------- | ------ | ---------------------------------------------------------------------------------- |
| Tests pass            | N/A    | Infrastructure-only change                                                         |
| Bilingual             | N/A    | No UI strings                                                                      |
| Accessibility         | N/A    | No UI                                                                              |
| Privacy               | N/A    | No data paths                                                                      |
| No restricted SDKs    | N/A    | Dev tools only                                                                     |
| Performance           | N/A    | No runtime code                                                                    |
| Branch hygiene        | PASS   | Feature branch from `main`, descriptive commit, `[bee]` tag, no direct `main` push |
| Verification evidence | PASS   | See below                                                                          |

## Verification evidence

1. **Hook exits 0 with no staged .ts/.tsx files:**

   ```
   $ npx lint-staged --concurrent false
   → lint-staged could not find any staged files matching configured tasks.
   EXIT: 0
   ```

2. **Hook exits 1 with type errors (intentional `const x: string = 42`):**

   ```
   ✖ bash -c 'pnpm --recursive typecheck':
   src/test-err.ts(1,14): error TS2322: Type 'number' is not assignable to type 'string'.
   EXIT: 1
   ```

3. **Husky configured correctly:**
   ```
   core.hooksPath = .husky/_
   ```
   Hook file is executable, `pnpm prepare` runs cleanly.

## Notes

- The hook blocks ALL commits when pre-existing type errors exist in the codebase (6 current errors in mobile/). These must be fixed before the hook can pass cleanly. This is the expected behavior for a strict typecheck gate.
- The `eslint.config.mjs` files were ported from `bd31b20a5` (AAAS-752 branch) — they were required for `eslint --fix` to work in the hook. These configs were not tracked on `main` and are now committed as part of this change.
- `pnpm-lock.yaml` is untracked on `main`, so it's not included in the commit.

## Escalation

None. Ready for Owl/Tortoise review.
