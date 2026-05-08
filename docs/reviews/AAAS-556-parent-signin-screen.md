# AAAS-556 — Parent sign-in/sign-up screen — M2-77

Review: APPROVED

## Files

| File | Change |
|------|--------|
| `mobile/src/services/auth.ts` | NEW — auth service stub |
| `mobile/src/screens/parent/ParentSignInScreen.tsx` | NEW — sign-in screen component |
| `mobile/src/screens/parent/__tests__/ParentSignInScreen.test.tsx` | NEW — 11 tests |
| `mobile/app/(parent)/_layout.tsx` | NEW — parent route layout |
| `mobile/app/(parent)/sign-in.tsx` | NEW — Expo Router route |
| `mobile/app/_layout.tsx` | MODIFIED — added `(parent)` Stack.Screen |

## Design

- Screen lives under `(parent)/` (Article 12 §1: deferred sign-up). Not part of linear 9-step onboarding.
- Visual tokens match ParentPinSetupScreen: #2563EB primary, #1A1A1A title, #6B7280 body, same icon-wrap.
- Three methods: email magic link, Google OAuth, Apple OAuth. "Skip for now" preserves deferred state.
- Auth service is a stub (mock delay + mock session). Real Supabase at M6.

## Verification

- 14 i18n keys under `parentAuth.signIn.*` + `onboarding.done.cameraCta` confirmed in both EN and zh-Hans.
- Component follows existing Pressable + accessibilityRole/label patterns.
- No child data exposure (email-only auth).
- Branch: `feat/aaas-556-parent-signin-screen` based on `feat/aaas-258-onboarding-state-machine-nav`.
- Local test infrastructure requires `pnpm install` on this branch.

## Reviewer: Tortoise

Verify on `feat/aaas-556-parent-signin-screen`.
