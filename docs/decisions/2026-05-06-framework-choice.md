# Decision: Cross-Platform Framework — React Native + Expo + TypeScript

**Status:** LOCKED (2026-05-06)  
**Author:** Owl  
**References:** ADD §7, decisions-locked.md, ARCHITECTURE.md

---

## Decision

**React Native 0.79+ with Expo SDK 53 and TypeScript** is the single cross-platform framework for tutor-sg v1. This is a locked decision — no re-litigation.

---

## Comparison: React Native + Expo vs Flutter

Both frameworks can ship production-quality iOS and Android apps. The comparison below evaluates each against tutor-sg's specific architectural requirements: on-device LLM inference via native C++ runtimes, platform-native vision/OCR APIs, native stylus input, and monorepo type-safety.

### 1. On-device LLM native bridge (ExecuTorch / LiteRT-LM)

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| C++ interop path | JSI / TurboModules / NitroModules — direct C++ calls from JS with zero bridge overhead. Existing community bridge: `react-native-executorch` for iOS + Android ExecuTorch deployment. | FFI via `dart:ffi` — functional but adds a Dart→C→native layer. No mature ExecuTorch or LiteRT-LM community plugin exists. |
| LiteRT-LM (Android) | Can embed via a Turbo Native Module wrapping the LiteRT-LM C API. Same pattern as ExecuTorch bridge. | Would require building a Flutter platform plugin from scratch; the Android embedding story is less documented than RN's JNI→TurboModule path. |
| Inference latency | Direct C++ call path — JSI ensures no serialization overhead for tensor I/O. | Dart FFI adds a thin but measurable hop; acceptable but unproven in production for interactive LLM inference. |
| Verdict | ✅ **RN wins.** The existence of `react-native-executorch` as a community starting point, combined with the mature JSI/TurboModule native interop, makes RN the lower-risk path for on-device LLM inference. | ⚠️ Flutter would require building all LLM bridges from scratch with no reference implementations. |

### 2. Native vision / OCR integration (Apple Vision + ML Kit)

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| Apple Vision (iOS) | Direct native module — write a TurboModule that calls VNRecognizeTextRequest and returns structured results to JS. Many established RN camera+vision libraries exist. | Platform channel or Pigeon-generated plugin. Works, but the Flutter camera→vision pipeline has fewer production references for OCR workflows. |
| ML Kit Text Recognition (Android) | Same pattern — TurboModule wrapping `com.google.mlkit.vision.text`. Mature ecosystem: `react-native-camera` + ML Kit integrations are well-trodden. | `google_mlkit_text_recognition` plugin exists and works. However, Flutter's camera plugin APIs have historically lagged behind RN in stability. |
| Camera preview + overlay | RN camera libraries support real-time preview with JS-rendered overlays. Expo Camera provides a unified API. | Flutter's camera plugin supports preview but the widget-tree overhead for overlays is higher. |
| Verdict | ✅ **RN wins** on ecosystem maturity for camera+vision pipelines. Flutter's ML Kit plugin is usable but the broader camera→OCR→overlay flow is less battle-tested in production apps. | ⚠️ Viable but higher integration risk. |

### 3. Stylus input (Apple Pencil + Android active stylus)

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| Apple Pencil (PencilKit) | Native module wrapping `PKDrawing` / `PKCanvasView`. PencilKit provides pressure, tilt, and stroke prediction out of the box. RN gesture system can coexist with native PencilKit views. | Platform channel to embed `PKCanvasView` as a UIKit view in Flutter. Technically works but the Flutter→UIKit embedding (via `UiKitView`) has known performance and gesture-disambiguation limitations. |
| Android stylus (S Pen / active stylus) | Native module wrapping `MotionEvent` with `TOOL_TYPE_STYLUS`, pressure, and tilt. Samsung's S Pen SDK can be integrated via a TurboModule. | Platform channel to embed an Android `View` with stylus input. Same embedding caveats as iOS. |
| Real-time marking latency | RN's native UI components (fabric) render on the platform UI thread — stylus strokes have no JS bridge latency. | Flutter renders via Skia/Impeller on its own raster thread. Pencil latency can match native if the stylus path is fully in-platform. |
| Verdict | ✅ **RN wins** on stylus. Embedding native PencilKit / Android stylus views is simpler and more reliable with RN's native UI component architecture. Flutter's platform view embedding is a known pain point. | ⚠️ Platform view embedding causes gesture conflicts and added latency. |

### 4. TypeScript monorepo type-safety

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| Shared code | TypeScript across mobile + shared packages. One type system end-to-end: shared types, validators (Zod), i18n keys, API contracts. | Dart across mobile. Shared packages are Dart packages. No TypeScript in Flutter (though a separate TS library could exist, it would duplicate types). |
| Monorepo DX | npm/pnpm workspaces, TypeScript project references, tRPC-style typed contracts between packages. Trivially shared between mobile and a future web companion. | Dart/Flutter monorepo via Melos. Dart-only — no cross-language type sharing without codegen. |
| Hiring / ecosystem | TypeScript/React is the largest dev pool. Easier to hire contract RN devs in Singapore/Southeast Asia than Flutter devs. | Dart is a smaller pool. Flutter hiring in Singapore is feasible but more constrained. |
| Verdict | ✅ **RN wins** on type-safety and monorepo cohesion. TypeScript's end-to-end type coverage across mobile, shared, and future web packages eliminates type drift. | ⚠️ Flutter+Dart is type-safe internally but creates a type boundary with any non-Dart companion code. |

### 5. Build + CI/CD (Expo EAS vs Flutter CI)

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| Build service | Expo EAS Build — managed cloud builds for iOS + Android. No local Xcode/Android Studio required for CI. EAS Submit pushes to App Store / Play Store. | Codemagic or GitHub Actions with self-hosted runners. Works but requires more CI setup. |
| OTA updates | Expo Updates — ship JS bundle updates without app store review. Critical for iterating on LLM prompts, UI, and content without a full release cycle. | Shorebird — code-push for Flutter. Works but less mature than Expo Updates. |
| Dev client | Expo Dev Client — custom debug build with native modules. Hot reload across JS + native. | Flutter hot reload — excellent for Dart code. Native plugin changes still require full rebuilds. |
| CI complexity | EAS + GitHub Actions integration is well-documented. Expo's managed workflow handles signing, provisioning, and build. | Codemagic is the gold standard for Flutter CI. Equivalent capability but fewer "one-command" conveniences. |
| Verdict | ✅ **RN wins** on CI/CD velocity. Expo EAS provides a managed pipeline from PR to store submission. OTA updates are a strategic advantage for an AI product where prompt/UI iteration happens faster than app store review cycles. | ⚠️ Flutter CI is mature (Codemagic) but lacks Expo's turnkey OTA update story. |

### 6. React Native ecosystem risk and Expo migration safety

| Risk | Mitigation |
|---|---|
| RN breaking changes | Expo SDK manages RN version bumps with a curated compatibility table. We pin to Expo SDK 53 and upgrade on Expo's cadence, not RN's. |
| Expo lock-in | Expo is a superset of RN — ejecting to bare RN is always possible. Expo EAS Build works with any RN app, even ejected ones. |
| Native module stability | We target a small, defined set of native modules (ExecuTorch, Vision, ML Kit, PencilKit, SQLite). Each is a TurboModule with a defined interface — swappable if upstream breaks. |
| Apple/Google policy changes | Expo's managed workflow is Apple/Google compliant. OTA updates comply with Apple's guidelines (JS-only updates, no native code changes). |

### Summary scorecard

| Dimension | React Native + Expo | Flutter |
|---|---|---|
| LLM native bridge (ExecuTorch / LiteRT-LM) | ✅ Strong | ⚠️ Unproven |
| Vision / OCR (Apple Vision + ML Kit) | ✅ Mature ecosystem | ⚠️ Workable |
| Stylus (PencilKit + Android stylus) | ✅ Reliable embedding | ⚠️ Platform-view friction |
| TypeScript monorepo type-safety | ✅ End-to-end TS | ⚠️ Dart-only |
| Build + CI/CD (EAS) | ✅ Turnkey + OTA | ⚠️ More setup |
| Developer availability (SG/SEA) | ✅ Large TS/RN pool | ⚠️ Smaller Dart pool |

---

## Conclusion

React Native + Expo SDK 53 + TypeScript is locked as the cross-platform framework for tutor-sg v1. This decision is driven by tutor-sg's specific technical requirements — on-device C++ LLM runtimes, platform-native vision and stylus APIs, and monorepo type-safety — where RN's native interop model and Expo's operational tooling are a clear fit.

No re-litigation. This document is the framework choice decision record and will not be reopened unless a `boss-needed` amendment overrides it.
