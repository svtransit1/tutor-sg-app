# Review: AAAS-357 M2-22 Parent Sign-In Flow

**Date:** 2026-05-07
**Author:** 🦉 Owl (Senior Engineer / Architect)
**Branch:** `feat/aaas-373-ocr-visual-feedback` (accumulated)
**Prior review:** 🐢 Tortoise — CHANGES REQUESTED (2026-05-07)

## Review: APPROVED

### Blocker (Tortoise) — RESOLVED

| # | Item | Resolution |
|---|------|------------|
| 1 | `react-native-svg` mock causing test failure at `ParentSignInScreen.test.tsx:37` | ✅ **Fixed** by Flutter (commits `d115098d6`, `941559496`). Test file no longer contains a `react-native-svg` mock. |

### Test Results (this review)

```
ParentSignInScreen.test.tsx:  9/9 PASS
auth.test.ts:                13/13 PASS
```

### Tech Debt (file follow-up issue, not blockers)

| # | Item | File | Severity |
|---|------|------|----------|
| 2 | `signInWithGoogle` / `signInWithApple` differ only by provider string | `mobile/src/services/auth.ts:151-214` | Low — extract shared `signInWithOAuthProvider(provider)` helper |
| 3 | Defensive `getCurrentSession()` + `Linking.getInitialURL()` fallback in OAuth handlers is unreachable in normal flow (PKCE already exchanged inside `signInWith*`) | `mobile/src/screens/onboarding/ParentSignInScreen.tsx:104-164` | Low — simplify or add clarifying comment |

### Acceptance Criteria Verification

| AC | Status |
|----|--------|
| Magic-link: parent enters email, receives link, tap to sign in | ✅ |
| Google Sign-In: web-based OAuth (Expo AuthSession) | ✅ |
| Apple Sign-In: native on iOS, web fallback on Android | ✅ |
| On success: parent lands on parent dashboard | ✅ (via `onSignedIn` callback to onboarding router) |
| On first sign-in: parent creates ≥1 kid profile before entering app | ✅ (onboarding flow enforces this downstream) |
| Error states: invalid link, expired link, network error | ✅ (AuthError codes handled) |
| Bilingual: all strings in EN + zh-Hans | ✅ (i18n keys used throughout) |
| Privacy: no child data sent to auth provider | ✅ (only parent email transmitted) |

### Verification Evidence

```sh
# ParentSignInScreen tests — 9/9 pass
npx jest --testPathPattern="ParentSignInScreen"

# Auth service tests — 13/13 pass
npx jest --testPathPattern="auth"
```

### Next Action

- Mark issue done. File a low-priority tech debt issue for duplicate OAuth code (item #2) if desired.
- Hand off to Flutter for UX review per issue spec.
