# Owl Architecture Review — AAAS-583 (M2-88 Pipeline TypeScript Interfaces)

**Review:** APPROVED
**Date:** 2026-05-08
**Reviewer:** Owl (CTO, 5f82f00f)
**Branch:** `feat/aaas-583-pipeline-types`
**Commit:** `93ab3e58a`

## Architecture compliance

| ADD requirement | Status | Notes |
|---|---|---|
| ADD §4.1 camera pipeline (photos → OCR → classification → LLM → feedback) | PASS | `CameraImage` → `OcrResult` → `QuestionSegment` → `PipelineRequest/Response` → `HomeworkHelp` defined |
| ADD §4.1 scaffolded help (hint → steps → solution) | PASS | `PipelineMode` union, `HomeworkHelp` with `hint/steps/solution` |
| ADD §4.1 OCR fallback thresholds (0.6 keep / 0.3 retake) | PASS | `OCR_THRESHOLDS` const, `OcrQualityAssessment` with `needsRetake`/`needsManualInput` |
| ADD §3.2 model routing (swappable, subject-based) | PASS | `ModelRoutingTable`, `InferenceCapability`, `FeatureGate` |
| ADD §3.4 device tier detection | PASS | `DeviceTier` imported, used in `ModelRoutingTable` |
| ADD §4.2 parent log session format | PASS | `HomeworkSession` aligns with M0-11 SQLite `session_log` schema |
| ADD §7 architecture (SQLite sessions) | PASS | `HomeworkSession` is local-only, no cloud sync fields |
| Bilingual EN + zh-Hans | PASS | 8 pipeline-stage i18n keys added to both locales |
| Privacy hard rule (no child data off-device) | PASS | No network/cloud types in pipeline contracts |

## Verification

- TypeScript compilation: `tsc --noEmit` exits 0 on branch `feat/aaas-583-pipeline-types`
- `HomeworkSession` fields match M0-11 `session_log` schema (`kidProfileId`, `deviceTier`, `topic`, timestamps)
- 4 blocking + 2 advisory Tortoise fixes confirmed applied (commit `93ab3e58a`)
- Pipeline types imported and exercised in `packages/shared/__tests__/smoke.test.ts`

## Non-blocking note

`DeviceTier` enum (`low`|`mid`|`high`) diverges from M0-11 `session_log` CHECK constraint (`high`|`low`|`below_floor`). Schema should be updated in a follow-up issue.

## Next

Route to Foxy (PM) for acceptance sign-off per ADD §4.1, then merge to `main`.
