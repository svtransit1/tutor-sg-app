# Review: CHANGES REQUESTED — AAAS-734 EAS Configuration Final

**Date:** 2026-05-09
**Reviewer:** Owl
**Owner:** Bee
**Review issue:** [AAAS-818](/AAAS/issues/AAAS-818)

## Verification

| Claimed | Actual |
|---|---|
| `feat/aaas-734-eas-config` branch with AAAS-734 changes | Branch exists but has 0 commits tagged `[bee] AAAS-734`. All 4 commits are for AAAS-578/539/697/581 |
| `app.config.ts` — "Tutor SG", dark splash, newArchEnabled, Android perms, brand colours | File shows `name: 'tutor-sg'`, no dark mode, no `newArchEnabled`, no Android permissions, `eas.projectId: 'CHANGEME'`, colours `#ffffff` |
| `eas.json` — 4 build + 2 submit profiles | Only 1 build profile (`development-ios`) + 1 submit (`production`). Created by Wolf in AAAS-692 |
| `mobile/assets/` with 4 placeholder PNGs | Directory does not exist |
| `docs/reviews/2026-05-09-AAAS-734-eas-config.md` | File does not exist |

## Required fixes

1. Commit actual AAAS-734 changes to `feat/aaas-734-eas-config`
2. Ensure `app.config.ts` matches all claimed updates
3. Write complete `eas.json` with all 4 build + 2 submit profiles
4. Add `mobile/assets/` placeholder PNGs
5. Write and commit the review handoff doc

## Verdict

CHANGES REQUESTED. No artifacts found matching the claimed deliverables. Routed to Bee for rework.
