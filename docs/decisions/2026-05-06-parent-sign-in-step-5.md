# Parent Sign-In — Onboarding Step 5/7

**Issue:** AAAS-224 (M2-40)
**Author:** Bee (Mobile Coder #2)
**Date:** 2026-05-06
**Status:** Implemented, tested

## Summary

Implemented onboarding step 5/7: Parent sign-in with email magic link, Google OAuth, and Apple OAuth via Supabase Auth.

## Files created/modified

### New files

| File | Purpose |
|---|---|
| `mobile/src/services/supabase.ts` | Supabase client singleton with PKCE auth config |
| `mobile/src/services/auth.ts` | Auth service: magic link, Google, Apple, session management |
| `mobile/src/screens/onboarding/ParentSignInScreen.tsx` | Parent sign-in screen component |
| `mobile/app/_layout.tsx` | Root expo-router layout |
| `mobile/app/(onboarding)/_layout.tsx` | Onboarding group layout |
| `mobile/app/(onboarding)/parent-sign-in.tsx` | Parent sign-in route |
| `mobile/app/auth/callback.tsx` | Deep-link auth callback handler |
| `mobile/src/services/__tests__/auth.test.ts` | Auth service tests (13 tests) |
| `mobile/src/screens/onboarding/__tests__/ParentSignInScreen.test.tsx` | Screen rendering tests (8 tests) |
| `mobile/__mocks__/expo-secure-store.ts` | Mock for expo-secure-store |
| `mobile/__mocks__/expo-web-browser.ts` | Mock for expo-web-browser |
| `mobile/__mocks__/expo-auth-session.ts` | Mock for expo-auth-session |
| `mobile/__mocks__/expo-linking.ts` | Mock for expo-linking |
| `mobile/__mocks__/@supabase/supabase-js.ts` | Mock for supabase-js |

### Modified files

| File | Change |
|---|---|
| `mobile/src/i18n/locales/en.json` | Added `parentAuth.signIn.*` keys (EN) |
| `mobile/src/i18n/locales/zh-Hans.json` | Added `parentAuth.signIn.*` keys (zh-Hans) |
| `mobile/jest.config.js` | Added module mappers for new deps; removed onboarding ignore |
| `mobile/package.json` | Added `@supabase/supabase-js`, `expo-auth-session`, `expo-web-browser`, `expo-secure-store` |

### New dependencies

- `@supabase/supabase-js@^2.105.3` — Supabase client
- `expo-auth-session@^55.0.15` — OAuth flow management
- `expo-web-browser@^55.0.15` — System browser for OAuth
- `expo-secure-store@^55.0.13` — Secure token storage

## Architecture

### Auth flow

```
ParentSignInScreen
├── Email magic link: signInWithMagicLink(email)
│   → supabase.auth.signInWithOtp() with PKCE
│   → User clicks link → /auth/callback → exchangeCodeForSession()
│   → Session persisted to SecureStore
├── Google OAuth: signInWithGoogle()
│   → supabase.auth.signInWithOAuth(provider: 'google')
│   → WebBrowser.openAuthSessionAsync() → callback → exchangeCodeForSession()
├── Apple OAuth: signInWithApple()
│   → supabase.auth.signInWithOAuth(provider: 'apple')
│   → WebBrowser.openAuthSessionAsync() → callback → exchangeCodeForSession()
└── Skip for now → router.replace('/(onboarding)/grade-pick')
```

### Screen states

- `idle` — Default sign-in form
- `loading_magic_link` — Sending magic link (spinner on button)
- `magic_link_sent` — "Check your email" state with resend option
- `loading_oauth` — Opening system browser for OAuth
- `signed_in` — Success state
- `error` — Error message display

### i18n

All user-facing strings are bilingual (EN + zh-Hans) in flat-keyed JSON under the `parentAuth.signIn.*` namespace.

## Verification

- TypeScript: `tsc --noEmit` — 0 errors in new code (pre-existing errors only)
- Tests: 21/21 pass
  - Auth service: 13 tests (magic link valid/invalid/failure, OAuth success/cancellation, callback, session, sign-out)
  - Screen rendering: 8 tests (renders all elements, callbacks, dividers)

## Integration points

- Route: `/(onboarding)/parent-sign-in`
- On success: calls `onSignedIn()` → navigates to `/(onboarding)/grade-pick`
- On skip: calls `onSkip()` → navigates to `/(onboarding)/grade-pick`
- Auth callback: `/auth/callback` handles PKCE code exchange via deep link
- Deep link scheme: `tutor-sg://auth/callback?...`

## Known issues

- **Pre-existing React version mismatch**: `react@19.2.6` vs `react-native-renderer@19.1.0` bundled with RN 0.81.0 causes `AggregateError` during `act()`. Interaction tests using `fireEvent` are affected. Rendering tests work fine. Fix: pin react to ^19.1.0 via `pnpm` overrides (requires pnpm workspace fix).

## Next steps

- Wire fully into M2 onboarding flow (steps 1–4, 6–7)
- Configure Supabase project with redirect URLs for the app scheme
- Set proper env vars in `.env.local`
- Test on real device (magic link + OAuth redirects)

## Cross-references

- ADD §6.5: Auth model (parent only)
- ADD §7: Backend sketch (Supabase auth)
- Article 12: Onboarding dev spec (step 5/7)
- Architecture doc §6.5: Auth model details
