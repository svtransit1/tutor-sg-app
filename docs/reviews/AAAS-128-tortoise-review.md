# Review: AAAS-128 — OCR Pipeline (Apple Vision + ML Kit Native Module)

**Reviewer:** 🐢 Tortoise  
**Date:** 2026-05-07  
**Status:** APPROVED  
**Branch:** `feat/aaas-128-ocr-pipeline`  
**Commit:** `d3fafbd`

## Rubric

### R1 — Acceptance criteria
| Criterion | Verdict | Evidence |
|---|---|---|
| RN native module: iOS + Android | ✅ | `ios/TutorSgOcrModule.swift` (Apple Vision VNRecognizeTextRequest), `android/.../TutorSgOcrModule.kt` (ML Kit TextRecognition) |
| JS API: `recognizeText(imagePath)` | ✅ | `src/TutorSgOcrModule.ts` exports async `recognizeText(imagePath, options?)` + `isOcrAvailable()` |
| Confidence scoring per block | ✅ | iOS: `topCandidate.confidence`; Android: per-element confidence averaging with configurable threshold |
| Bilingual defaults | ✅ | `["en", "zh-Hans"]` recognition languages; Android `ChineseTextRecognizerOptions` for Chinese locale |
| Orientation correction | ⚠️ Note | iOS EXIF-aware via CGImageSource; Android uses BitmapFactory.decodeStream (no EXIF auto-rotate). Per ADD §4.1/§7, orientation correction is a pipeline pre-step — scope boundary is correct |
| Question segmentation | ⚠️ Note | Explicitly out of scope per ADD §7 ("in-house segmentation layer"). This module provides raw OCR blocks |

### R2 — Artifact exists
- Branch `feat/aaas-128-ocr-pipeline` — ✅ exists locally and on origin
- Commit `d3fafbd [bee] AAAS-128: M2-12 — OCR pipeline native module (Apple Vision + ML Kit)` — ✅ found
- 19 files, 1030 lines added — ✅ all traced to OCR module

### R3 — Tests pass
- **8/8 passing** (fresh run, verified 2026-05-07)
- TypeScript compilation: clean (no errors)

### R4 — Scope discipline
All files trace to the OCR module or its workspace integration (`mobile/package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`). No scope creep.

### R5 — Bilingual / i18n
Native module uses bilingual defaults. No user-facing UI strings (this is an engine-level native module).

### R6 — Privacy
- All recognition on-device ✅
- No network calls ✅
- README explicitly documents privacy guarantee ✅

### R7 — Build verification
- TypeScript: compiles clean (`tsc --noEmit` → no errors)
- Tests: 8/8 passing
- Full native build (Xcode/Gradle) requires workspace dependency resolution; pre-existing blocker `@tutor-sg/device-tier` missing package.json prevents full `pnpm install`

## Verdict

**Review: APPROVED**

The module delivers all scoped acceptance criteria. Architecture aligns with ADD §4.1 and §7 (core OCR engine, with orientation/segmentation as pipeline pre-fixes). Code quality is high — clean Swift/Kotlin, proper Expo Modules API patterns, confidence filtering, bilingual defaults. Tests cover happy path, options passthrough, error rejection, and availability gating.

### Recommendations (not blockers)
1. **Android EXIF orientation** — Consider adding `ExifInterface` rotation check in a follow-up if pre-processed images aren't guaranteed.
2. **Workspace dependency** — `@tutor-sg/device-tier` missing `package.json` blocks full `pnpm install`. This is a pre-existing issue, not introduced by this PR.
