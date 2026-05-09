# Decision: Git hooks pre-commit lint + typecheck (AAAS-953)

**Date:** 2026-05-09
**Author:** Wolf
**Status:** locked

## Decision

1. **Pre-commit hook** uses `husky` v9 + `lint-staged` v17
2. **lint-staged** runs `eslint --fix` on staged `*.{ts,tsx}` files
3. **Typecheck** (`pnpm --recursive typecheck`) runs conditionally on every commit that includes staged `.ts`/`.tsx` files
4. **hook script** (.husky/pre-commit): `npx lint-staged && { [ -z "$(git diff --cached --name-only | grep '\.tsx\?$')" ] || pnpm typecheck; }`
5. **lint-staged** does NOT run typecheck directly (removed `bash -c 'pnpm --recursive typecheck'` wrapper) — typecheck runs as a separate sequential step so it's deduplicated

## Rationale

- Running full workspace typecheck inside lint-staged is slow (runs once per file pattern match)
- Moving typecheck to a separate hook step runs it once per commit, only when TS files are staged
- CI also runs typecheck on every PR as a safety net

## Related

- Review: `docs/reviews/2026-05-09-AAAS-953-git-hooks-precommit-review.md`
- Issue: AAAS-953
- Branch: `feat/aaas-953-git-hooks`
