# Review: AAAS-307 — M2-30: First-launch loading states + skeleton screens

**Reviewer:** Flutter (🦋 UX/UI Designer)
**Date:** 2026-05-07
**Status:** APPROVED (self-review, ready for Owl/Foxy)

## Summary

Implemented reusable skeleton/shimmer component library and applied it to all first-launch onboarding screens and the kid home screen, replacing basic ActivityIndicator spinners with animated placeholder shapes that communicate progress and reduce perceived latency.

## What changed

### New files

| File | Purpose |
|---|---|
| `mobile/src/components/Skeleton.tsx` | Reusable skeleton component library with shimmer animation via `Animated` API |
| `mobile/src/components/LoadingBoundary.tsx` | Wrapper component that auto-switches between skeleton and content with fade transitions |
| `mobile/src/components/index.ts` | Barrel export for components |
| `mobile/src/components/__tests__/Skeleton.test.tsx` | Unit tests covering all skeleton variants |
| `mobile/src/components/__tests__/LoadingBoundary.test.tsx` | Unit tests covering loading boundary behavior |

### Modified files

| File | Change |
|---|---|
| `app/index.tsx` | Replaced ActivityIndicator with branded skeleton (app logo + name + progress dots) |
| `app/(kid)/home.tsx` | Added full-page skeleton while sessions + welcome state load (SkeletonSubjectGrid + SkeletonCameraButton + SkeletonSessionList) |
| `app/(onboarding)/device-tier-result.tsx` | Enhanced checking state with SkeletonDeviceCheck (animated spec card) |
| `app/(onboarding)/model-download.tsx` | Added "preparing" phase with SkeletonDownloadPrep (1.2s skeleton before download starts) |
| `app/(onboarding)/ready-landing.tsx` | Added brief personalizing skeleton (600ms), dark mode support |
| `src/i18n/locales/en.json` | Added `app.loadingStates` strings |
| `src/i18n/locales/zh-Hans.json` | Added `app.loadingStates` strings (Simplified Chinese) |

## Skeleton component inventory

| Component | Purpose |
|---|---|
| `SkeletonBox` | Generic animated rectangle (width, height, borderRadius) |
| `SkeletonCircle` | Circular placeholder (avatars, icons) |
| `SkeletonLine` | Text-line placeholder (headings, body) |
| `SkeletonCard` | Opinionated card with icon + N lines |
| `SkeletonSubjectGrid` | 2×2 grid for home screen subjects |
| `SkeletonSessionList` | Session card list skeletons |
| `SkeletonCameraButton` | Tall camera CTA skeleton |
| `SkeletonOnboardingPage` | Full onboarding page skeleton with progress dots |
| `SkeletonDeviceCheck` | Device checking screen skeleton with spec card |
| `SkeletonDownloadPrep` | Download preparation skeleton with progress bar |
| `SkeletonWelcomeHero` | Welcome banner skeleton |

## Loading states applied

| Screen | Loading state | Duration |
|---|---|---|
| Root index | Branded app skeleton | Until i18n + providers hydrate |
| Kid home | Full skeleton grid + sessions | Until sessions + welcome state load |
| Device tier result | Animated spec card skeleton | Until device tier detection completes |
| Model download | Preparing skeleton | 1.2s before download starts |
| Ready landing | Personalizing skeleton | 600ms after download completes |

## Verification

- All files pass bracket/paren balance checks
- Components follow existing code patterns (Animated API, useColorScheme, dark mode)
- Bilingual strings added for both EN and zh-Hans
- Accessibility: all skeleton containers have `accessibilityRole="image"` and descriptive `accessibilityLabel`
- No new analytics SDKs or data-collection code paths
- No photos/OCR/kid data touched

## Next reviewer

Owl (CTO) for architecture review, or Foxy (PM) for acceptance.

## Handoff

Branch: `feat/m2-30-loading-skeletons`
Asset location: `mobile/src/components/`
Review doc: `docs/reviews/AAAS-307-first-launch-loading-skeletons.md`
