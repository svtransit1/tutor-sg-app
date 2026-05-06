---
title: AAAS-251 — AGE_GATE screen review handoff
date: 2026-05-07
agent: Flutter (UX/UI Designer)
status: submitted_for_review
---

# AAAS-251: AGE_GATE Screen (onboarding step 2/7)

## Deliverable Summary

The Parent Gate screen (AGE_GATE) for onboarding step 2/7 has been implemented per the [m2-onboarding.md spec](../../docs/design/m2-onboarding.md).

### Screen behavior

- **Title:** "Parent setup" / "家长设置"
- **Body:** Explains the app needs a parent/guardian to set things up, asks to pass phone to grown-up
- **Primary action:** "I'm a parent / guardian" → `onComplete` callback (proceeds to PARENT_PIN_SETUP)
- **Secondary action:** "I'm not — go back" → `onGoBack` callback (returns to LANG_PICK)
- No error states (soft gate per spec)
- Privacy-safe: no data leaves device, no analytics

### Files

| File | Lines | Description |
|---|---|---|
| `mobile/src/screens/onboarding/AgeGateScreen.tsx` | 171 | Screen component with icon, title, body, 2 actions |
| `mobile/app/(onboarding)/age-gate.tsx` | 9 | Expo Router route at `/onboarding/age-gate` |
| `mobile/src/screens/onboarding/__tests__/AgeGateScreen.test.tsx` | 66 | 7 tests, 100% coverage |
| `mobile/src/i18n/locales/en.json` | +6 | 4 keys under `onboarding.parentGate` |
| `mobile/src/i18n/locales/zh-Hans.json` | +6 | Simplified Chinese translations |

### Test results

```
PASS src/screens/onboarding/__tests__/AgeGateScreen.test.tsx
  ✓ renders title and body copy
  ✓ renders both action buttons
  ✓ calls onComplete when primary button is pressed
  ✓ calls onGoBack when secondary button is pressed
  ✓ has accessibilityRole button on both actions
  ✓ has accessibilityLabel on both action buttons
  ✓ primary button shows correct text

Passed: 7, Failed: 0 (100% coverage)
All 31 existing suite tests also pass.
```

### Branch

- Branch: `feat/aaas-251-age-gate-screen`
- Commit: `8ca6287`
- Status: `in_review`

### Review checklist for reviewer

- [ ] Verify i18n keys match m2-onboarding.md spec exactly
- [ ] Confirm zh-Hans tone is appropriate (defer to Sage for polish)
- [ ] Verify the route integrates with navigation wiring (AAAS-230)
- [ ] Check WCAG AA contrast for all text
- [ ] Confirm no analytics SDKs in code paths

### Cross-references

- Spec: `docs/design/m2-onboarding.md` (section 3, "Parent Gate")
- ADD: App Design Document §8 (Compliance)
- Repo: `feat/aaas-251-age-gate-screen` branch
- Next: AAAS-230 (onboarding state machine wiring)
