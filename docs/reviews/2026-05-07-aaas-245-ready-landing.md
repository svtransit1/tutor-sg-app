# AAAS-245: M2-47 — DoneScreen / Ready Landing — Tortoise Review

**Date:** 2026-05-07
**Reviewer:** 🐢 Tortoise
**Branch:** `feat/aaas-245-ready-landing` (commit `74d84b1`)
**Assignee:** 🦋 Flutter

## What passes

- **Bilingual i18n completeness** — All `onboarding.done.*` keys present in both `en.json` and `zh-Hans.json`. Interpolation for kid name via `{{name}}` works correctly.
- **Accessibility** — `accessibilityRole="button"` and `accessibilityLabel` on every interactive element (camera CTA, subject tiles, parent area link). Celebration star has `accessibilityRole="image"` with label.
- **Dark mode** — Conditional styling via `useColorScheme()` with appropriate dark palette across all elements.
- **Font sizes** — title 28pt, subtitle 17pt, greeting 16pt, camera CTA title 20pt — all meet ADD §A79 min 16pt body requirement.
- **Touch targets** — Camera CTA has `paddingVertical: 18` (36pt), subject tiles have `paddingVertical: 20` (40pt) — meet 44pt recommended target with room for hitSlop.
- **Navigation** — Camera CTA → `/(kid)/camera`, subject tiles → `/(kid)/home`, Parent area → `/(parent)/dashboard`. All correct.
- **Tests** — 13 unit tests covering render, i18n, accessibility, and navigation all passing.
- **No analytics SDKs** — Clean. No data-leaving-device paths.
- **OnboardingProgressIndicator** — Step 7/7 shown correctly.
- **Parent area link** — Fixed at bottom, PIN-gated navigation.

## Issues found

### (CRITICAL) AC1: Privacy reminder badge missing

The acceptance criteria explicitly require: **"Privacy badge visible without scroll"** with copy "Your homework never leaves this device". No privacy badge is rendered in `done.tsx`. The onboarding dev spec (Article 12) also says to "Surface the privacy promise (data stays on device) prominently — that's our wedge."

**Fix:** Add a privacy reminder badge above the Parent area link or near the camera CTA, with bilingual i18n key. Must be visible without scroll.

### (MINOR) Scope: Static celebration instead of animated

Scope says "Animated checkmark or celebration micro-interaction". The current implementation uses a static ⭐ emoji. Acceptable for MVP if animated checkmark is deferred, but scope should be updated or animation added.

### (INFO) Hardcoded kidName + onboarding persistence TODO

- `const kidName = 'Alex'` is hardcoded — acceptable as staged dependency with TODO.
- `// TODO: Persist onboarding completed flag via MMKV` — acknowledged.

## AC met

- [ ] AC1: Screen renders in both EN + zh-Hans ✅
- [ ] AC2: CTA navigates to kid home screen ✅
- [ ] AC3: Privacy badge visible without scroll ❌ **(missing)**
- [ ] AC4: Accessibility: VoiceOver/TalkBack reads CTA + privacy text ❌ **(CTA has labels, privacy text missing entirely)**
- [ ] AC5: Passes Tortoise quality review per ADD §9 ⏳ **(blocked by AC3)**

## Verdict

**Review: CHANGES REQUESTED** ❌

Route: 🦋 Flutter — add privacy reminder badge per AC, then re-request review.
