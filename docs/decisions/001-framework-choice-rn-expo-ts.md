# Decision 001: App Framework — React Native + Expo + TypeScript

**Date:** 2026-05-07
**Status:** accepted
**Decider:** Owl (CTO), per ADD §7 delegation
**Consults:** ADD §7, DeepTutor architecture lift (article 04), repo skeleton at `/Users/muatan/tutor-sg-app`

---

## Context

tutor-sg is a cross-platform mobile app (iOS 16+ / Android 11+) with an on-device LLM core, camera/OCR pipeline, stylus input, and IAP. We need one codebase targeting both platforms. The ADD §7 says:

> **Cross-platform:** Flutter or React Native (Owl's call, week 1, locked by end of week 1)

Week 1 is now. The repo already has a working Expo SDK 54 + TypeScript monorepo skeleton (`mobile/`, `packages/shared`). This document records the final decision and the rationale.

---

## Decision

**React Native + Expo + TypeScript** is the sole app framework for tutor-sg.

The repo uses Expo SDK 54 (`expo-router` for navigation, `expo-camera`, `expo-sqlite`, `expo-file-system`, `expo-localization`, `expo-image-picker`). All app code lives in `mobile/src/`. Shared types, Zod schemas, and utility code live in `packages/shared/`.

Builds go through Expo EAS for both platforms.

---

## Alternatives considered

### Alternative A: Flutter + Dart

**Why we considered it:**
- Single codebase, iOS + Android from one Dart project.
- Strong GPU/rendering layer (Impeller) — attractive for stylus ink and worksheet rendering.
- `flutter_vision` + `google_ml_kit` packages exist for OCR.
- `flutter_executorch` is in early community development.

**Why we rejected it:**
1. **LLM runtime bridge risk.** `react-native-executorch` is maintained by Software Mansion (the ExecuTorch integration team, not a community volunteer). The Flutter equivalent is far less mature. This is our single highest-risk dependency — if the inference bridge doesn't work, the product doesn't exist.
2. **Language schism.** Shared packages (`packages/shared`) are TypeScript — Zod schemas, capability manifests, i18n phrase tables, syllabus topic trees, and the content generation toolchain. Flutter would force Dart ↔ TypeScript duplication or a codegen bridge, adding maintenance cost with no product benefit.
3. **Ecosystem depth for on-device ML.** React Native has first-party ExecuTorch bindings and a broader JavaScript ML ecosystem (the LiteRT-LM team ships JS examples alongside the Android native SDK). Flutter's ML ecosystem is smaller and primarily community-maintained.
4. **Expo managed workflow.** Expo EAS provides managed builds, OTA updates, and a unified config layer (`app.json`) that removes Gradle/Xcode project drift — important for a small team with an autonomous agent fleet that can't manually reconcile build system churn.

### Alternative B: Native (SwiftUI + Jetpack Compose)

**Why we considered it:**
- Best-in-class platform integration for PencilKit, StoreKit 2, Apple Vision, ML Kit.
- Zero bridge overhead for the LLM runtime.

**Why we rejected it:**
1. **Two codebases.** We are a small autonomous fleet. Maintaining feature parity across Swift and Kotlin codebases is not feasible at our team size.
2. **No shared logic layer.** All shared types, schemas, i18n, and capability manifests would need a third "common" layer anyway — at which point we're back to a cross-platform framework plus native modules only where needed.
3. **Overkill for the product surface.** The app is not a 3D game or a camera app pushing 240 fps. The UI is chat, worksheets, dashboards, and settings — all within React Native's performance envelope.

### Alternative C: Ionic / Capacitor / PWA

Not considered. WebViews cannot host an on-device LLM runtime with native performance. Rejected without further analysis.

---

## Criteria and scoring

| Criterion | Weight | RN+Expo+TS | Flutter | Native |
|---|---|---|---|---|
| ExecuTorch bridge maturity | Critical | ✅ Software Mansion official | ⚠️ Community, early | ✅ Direct |
| Single language across app + shared packages | High | ✅ TypeScript end-to-end | ❌ Dart/TS schism | ❌ Swift/Kotlin/TS |
| Managed build pipeline (EAS) | High | ✅ | ⚠️ Codemagic | ❌ Manual |
| Stylus API access | Medium | ✅ Native modules bridge | ✅ Impeller | ✅ Direct |
| OCR / Vision pipeline | Medium | ✅ Native modules bridge | ✅ ML Kit plugins | ✅ Direct |
| OTA update capability | Medium | ✅ expo-updates | ❌ Store review required | ❌ Store review required |
| Team familiarity (existing repo) | Medium | ✅ Already scaffolded | ❌ | ❌ |
| Kid-safe UI performance (60 fps) | Medium | ✅ With Reanimated | ✅ Impeller | ✅ Native |
| IAP SDKs (StoreKit 2, Play Billing v6) | Medium | ✅ Native modules | ✅ | ✅ |

---

## Trade-offs accepted

1. **Native modules for performance-critical paths.** Camera preview, OCR, LLM inference, and stylus ink run through native modules — the RN bridge overhead is acceptable for control flow, not for hot loops. This is standard React Native architecture and is the pattern `react-native-executorch` follows.
2. **Expo managed workflow constraints.** We accept that some native-module authoring requires `expo-modules-core` conventions. This is a one-time cost and Expo SDK 54's native module API is stable.
3. **No web target from the mobile codebase.** We are mobile-first. The parent dashboard web companion is a separate project (low-priority, post-launch) and does not share the React Native codebase. Expo's web target is not used.
4. **Build service cost.** Expo EAS has per-build pricing. At our scale (autonomous fleet, modest build volume), this is negligible compared to the engineering time saved by not maintaining local build machines.

---

## Out of scope for this decision

- **Web companion framework** (the parent dashboard on web). That will be a separate decision when the web companion is scheduled.
- **Backend framework** (Supabase is the current choice per ADD §7; that is a separate infra decision).
- **Testing framework details** (Jest + React Native Testing Library are already in `mobile/package.json`; Detox/Maestro for E2E is a separate QA decision).

---

## Consequences

- All mobile code lives in `mobile/src/` using Expo Router (file-based routing).
- Shared code (types, schemas, utilities) lives in `packages/shared/` and is consumed by `mobile/` via workspace dependency `"@tutor-sg/shared": "*"`.
- All new features target React Native components. No native screens except where the LLM runtime, camera, and stylus pipelines require native modules.
- The `docs/ARCHITECTURE.md` already reflects this stack. No architectural changes are needed.

---

## References

- [[ADD §7]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) — framework delegation to Owl
- [[Article 04 — DeepTutor Architecture Lift]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md) — stack derivation from steal-sheet
- [[decisions-locked]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md) — locked decisions this must not contradict
- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) — full architecture, now reflects this decision
- Repo: `/Users/muatan/tutor-sg-app` — Expo SDK 54 monorepo, already scaffolded
