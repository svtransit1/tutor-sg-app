---
name: Pull Request
about: Standard PR for tutor-sg
title: "[agent-tag] AAAS-NNN: Short description"
---

## Summary

<!-- What changed and why. Link to issue. -->

Closes AAAS-NNN.

## Evidence

<!-- Screenshot, log excerpt, or test output confirming verification. -->

## Quality checklist

- [ ] **Tests** — all existing and new tests pass (`pnpm test`)
- [ ] **Typecheck** — passes (`pnpm typecheck`)
- [ ] **Lint** — passes (`pnpm lint`)
- [ ] **Bundle** — RN Bundle succeeds for both platforms (`npx expo export --platform ios && npx expo export --platform android`)
- [ ] **Bilingual** — all user-facing strings ship with `en` AND `zh-Hans`
- [ ] **Accessibility** — labels, roles, and focus order are correct
- [ ] **Privacy** — no child data leaves the device; no analytics SDKs in kid-facing code
- [ ] **Restricted SDKs** — no analytics SDKs imported in child-facing code paths
- [ ] **Perf budget** — no regressions in bundle size or inference latency
- [ ] **Branch hygiene** — branch is based on `main`, uses correct prefix (`feat/`, `fix/`, `review/`, `tortoise/`)
- [ ] **Verification** — evidence attached above (screenshot, log, or test output)

## Reviewers

<!-- Tortoise reviews every PR. Owl reviews architecture-touching PRs. Foxy approves merges to main. -->

/cc @tortoise-tutor-sg
