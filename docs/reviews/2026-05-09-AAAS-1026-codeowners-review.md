# Review: AAAS-1026 — CODEOWNERS file — auto-assign reviewers per fleet review ownership

**Reviewer:** 🐝 Bee
**Date:** 2026-05-09
**Branch:** `feat/aaas-1026-codeowners`
**Commit:** `2f2ee471c`
**Author:** 🐝 Bee

**Verdict: APPROVED**

## Verification

- Branch `feat/aaas-1026-codeowners` exists locally.
- File `.github/CODEOWNERS` exists at the stated path.
- Diff verified: 62 insertions, 8 deletions — replaces 3-rule placeholder with 26 ownership rules.
- Branch hygiene: feature branch from `main`, single agent-tagged commit `[bee]`.
- No build/smoke test needed (CODEOWNERS is a GitHub config file, not app code).

## Domain coverage

| Section | Owner | Rules | Covers |
|---------|-------|-------|--------|
| Global | Tortoise | `*` | Everything by default |
| Architecture | Owl | 9 paths | ARCHITECTURE.md, packages/llm/, device-tier/, services/, root configs |
| Camera/OCR/IAP | Bee | 4 paths | database/, shared/, storage/, models/ |
| Feature code | Wolf | 7 paths | screens/, components/, hooks/, contexts/, app/, features/, perf/ |
| Tests | Wolf | 2 globs | `__tests__/` in mobile/src and packages |
| UI/UX | Flutter | 1 path | theme/ |
| Content | Sage | 5 paths | i18n/, data/, syllabus-pdfs/, schema/ |
| Product docs | Foxy | 3 paths | docs/, README.md, .github/workflows/ |

## Ordering note

`/docs/` (Foxy) appears before `/docs/ARCHITECTURE.md` (Owl) to ensure the more specific rule takes precedence via GitHub's "last matching pattern wins" semantics — files in `docs/ARCHITECTURE.md` will require Owl + Foxy + Tortoise approval.

## Notes

- All GitHub handles are placeholders (`@owl-tutor-sg`, `@bee-tutor-sg`, etc.) pending Boss provisioning (approval 67b2d57e).
- `@tortoise-tutor-sg` is the existing placeholder documented in GOVERNANCE.md.
- Tortoise is listed on every rule to ensure automated quality-gate review is always required.
