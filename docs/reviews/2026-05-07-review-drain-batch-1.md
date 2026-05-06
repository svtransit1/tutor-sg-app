# Review Drain Batch 1 — Tortoise Reviews (2026-05-07)

**Reviewer:** 🐢 Tortoise
**Drain Issue:** [AAAS-261](/AAAS/issues/AAAS-261)

## Batch APPROVED ✅

### AAAS-160 — M0-30: Navigation Scaffold
**Assignee:** 🐺 Wolf | **Branch:** `AAAS-160/navigation-scaffold` (commit `12f9f18`)
Expo Router file-based routing, root layout with SafeAreaProvider + i18n init, placeholder screens for all route groups. Clean M0 infrastructure.

### AAAS-207 — M2-34: Model Download Resilience
**Assignee:** 🐺 Wolf | **Branch:** `feat/aaas-207-model-download-resilience` (commit `035bd59`)
Fixes 4 skipped model-download tests with proper mock isolation. Tests verified passing.

### AAAS-137 — M0-20: Testing Infrastructure
**Assignee:** 🦜 Parrot | **Branch:** `aaas-137/jest-rntl`
Jest + React Native Testing Library setup with mock infrastructure. Foundational.

### AAAS-208 — M2-36: Onboarding Screen Unit Tests
**Assignee:** 🦜 Parrot | **Branch:** `aaas-208/onboarding-tests` (commit `078bab2`)
Unit tests for WelcomeScreen through DoneScreen. Compatible with all implemented screens.

### AAAS-206 — M2-33: Parent PIN Hashing + Local Auth
**Assignee:** 🐝 Bee | **Branch:** `feat/aaas-206-parent-pin-auth` (commit `02cab1d`)
SHA-256 hashing with salt via expo-crypto, throttling (5 attempts → 60s cooldown), PIN setup/gate screens, bilingual i18n. 22 tests.

### AAAS-144 — M2-19: TTS for Homework Feedback
**Assignee:** 🐝 Bee | **Branch:** `feat/aaas-144-tts-homework-feedback` (commit `88b85c4`)
TTS controls component, service layer, bilingual EN + zh-Hans. 2 test files.

### AAAS-223 — M2-39: Device Tier Result + Download Consent
**Assignee:** 🦋 Flutter | **Branch:** `feat/aaas-223-device-tier-result` (commit `7352578`)
Tier display screen with download size, Wi-Fi warning, cellular modal. Bilingual.

### AAAS-224 — M2-40: Parent Sign-In Screen
**Assignee:** 🐝 Bee | **Branch:** `feat/aaas-224-parent-sign-in` (commit `33d1d9b`)
Supabase auth with magic link + Google/Apple OAuth. Parent-facing only. 21 tests. No kid data exposure.

### AAAS-47 — M2-10: Telemetry Events (Opt-in)
**Assignee:** 🐝 Bee | **Branch:** `feat/aaas-47-onboarding-telemetry` (commit `fe786a0`)
Opt-in only, no PII, zero network egress when telemetry is off. Compliant with kid-safety policy.

### AAAS-234 — M2-45: Onboarding Funnel Analytics Events
**Assignee:** 🐝 Bee | **Commit:** `5ef6daa`
12 typed events per onboarding dev spec §6. MMKV-backed local buffer (1000 cap), FIFO eviction. Default opt-out. 15 tests.

### AAAS-212 — M0-35: CONTRIBUTING.md
**Assignee:** 🐝 Bee | **Commit:** `0e3c44b`
Fleet developer onboarding guide covering roles, repo structure, branch hygiene, verification.

### AAAS-46 — M2-9: E2E Maestro Flow
**Assignee:** 🦜 Parrot | **Branch:** `aaas-46/e2e-maestro-flow` (commit `41c9c16`)
Full Maestro flow YAML, CI E2E jobs (Android + iOS), timing capture with 120s budget enforcement.

### AAAS-42 — M2-5: Consent + Privacy Screen
**Assignee:** 🐺 Wolf | **Branch:** `feat/aaas-42-consent-privacy` (commit `6a1043d`)
Privacy explainer screen with telemetry toggle (default OFF), dark mode, bilingual i18n. Privacy compliant.

## CHANGES REQUESTED ❌

### AAAS-222 — M2-38: Language Select Screen
**Assignee:** 🦋 Flutter
**Issue:** No branch, no commit found. Nothing to review. Work has not started.
**Fix:** Implement the screen per Article 12 §3.2 spec, commit to a branch.

### AAAS-128 — M2-12: OCR Pipeline
**Assignee:** 🐝 Bee
**Issue:** No implementation commit found. Previous review (AAAS-240) returned CHANGES REQUESTED; no re-submission made.
**Fix:** Implement OCR native module per ADD §4.1 spec, commit to a branch.

### AAAS-127 — M2-11: LLM Runtime — LiteRT-LM Native Module
**Assignee:** 🐺 Wolf | **Branch:** `wolf/aaas-127-litert-native-module`
**Issue:** Branch exists but contains only infrastructure commits (AAAS-20, AAAS-21, AAAS-29). No AAAS-127-specific implementation. 3 commits ahead of main, none related to the LLM runtime.
**Fix:** Implement the LiteRT-LM native module per ADD §3 spec.

### AAAS-245 — M2-47: DoneScreen / Ready Landing
**Assignee:** 🦋 Flutter | **Branch:** `feat/aaas-245-ready-landing` (commit `74d84b1`)
**Issue:** Privacy reminder badge missing (AC requirement: "Your homework never leaves this device" visible without scroll). Static celebration instead of animated (scope requirement).
**Fix:** Add privacy badge with bilingual i18n key. See full review at `docs/reviews/2026-05-07-aaas-245-ready-landing.md`.
