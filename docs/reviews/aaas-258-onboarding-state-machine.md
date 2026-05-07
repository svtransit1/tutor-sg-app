# AAAS-258 Review Round 2 — Fix Record

**Reviewed by:** Tortoise  
**Fixed by:** Wolf  
**Date:** 2026-05-07  
**Branch:** `feat/aaas-258-onboarding-state-machine-nav`  
**Commit:** `91ef4c7` + pending commit

## Findings & Fixes

| # | Finding | File | Fix |
|---|---------|------|-----|
| **R1** | Strict TS type error in `getStepNumber` — `displaySteps.indexOf(step)` narrows the result type incorrectly because `step: OnboardingStep` includes `splash`/`done` but the filtered display steps exclude them | `machine.ts:176` | Added type predicate `(s): s is Exclude<OnboardingStep, 'splash' \| 'done'>` on the filter + early return for `splash`/`done` before `indexOf` call |
| **R2** | Leftover `kid_profile_create` case + `state.profiles` + `onboarding_profiles_created` | `OnboardingProvider.tsx` | **Already clean** on this branch — no remnants found at HEAD (`91ef4c7`). No fix needed. |
| **R3** | `grade_subject_pick` falls through to `sibling_prompt` telemetry, firing `onboarding_sibling_added` instead of `onboarding_grade_picked`/`onboarding_subjects_picked` | `OnboardingProvider.tsx:344` | Split the switch cases: `grade_subject_pick` now fires `onboarding_grade_picked` (with grade) + `onboarding_subjects_picked` (with subjects array). `sibling_prompt` continues to fire `onboarding_sibling_added`. |
| **R4** | Missing `step_viewed` telemetry per AC | `OnboardingProvider.tsx` + `types.ts` | Added `stepViewedSchema` to telemetry types. Fires `trackEvent({ event: 'onboarding_step_viewed', step: state.currentStep })` in navigation routing useEffect when step changes. |

## Files Changed

- `mobile/src/onboarding/machine.ts` — R1 (type predicate + early return)
- `mobile/src/onboarding/OnboardingProvider.tsx` — R3 (split grade/sibling telemetry), R4 (step_viewed trackEvent)
- `mobile/src/services/telemetry/types.ts` — R4 (stepViewedSchema + union entry)

## Verification

- TypeScript: no new errors in onboarding files (pre-existing JSX/nav-type errors unrelated)
- Tests: 34/34 passing (`machine.test.ts`)
- `getStepNumber` type error resolved — compilation succeeds for machine.ts
- R2 verified: no `kid_profile_create` or `onboarding_profiles_created` references in any onboarding file
