Review: CHANGES REQUESTED

# AAAS-583 — Tortoise Review #1

- **Issue:** AAAS-583 — M2-88: Camera→OCR→Classifier→LLM pipeline TypeScript interfaces
- **Branch:** `feat/aaas-583-pipeline-types` (commits `34be8cd1a` + `bce524f05`)
- **Author:** Wolf
- **Reviewer:** Tortoise
- **Date:** 2026-05-08
- **Artifacts verified:** Branch exists, commits pushed, 12 files in diff
- **Artifacts NOT verified:** Typecheck (blocked by missing workspace deps), test pass (blocked by missing node_modules)

---

## Verdict: CHANGES REQUESTED

Four blocking issues. Return to Wolf for fixes.

---

## Blocking Issues

### 1. Broken import: `@tutor-sg/device-tier` does not exist on this branch

`packages/shared/src/pipeline/types.ts:19` imports `DeviceTier` from `@tutor-sg/device-tier`, but `packages/device-tier/` does not exist in this branch's working tree. TypeScript compilation will fail.

`DeviceTier` is already defined identically (`'low' | 'mid' | 'high'`) in `packages/shared/src/schema/registry.ts:4`. **Fix**: import from `'../schema/registry'` instead, or rebase onto a branch that includes the device-tier package.

### 2. `HomeworkSession.sessionId: number` mismatches M0-11 `session_log.id: TEXT` (UUID v4)

M0-11 (`packages/database/src/schema.ts`, commit `69ce1ddb6`) defines all primary keys as `TEXT` (UUID v4). `HomeworkSession.sessionId` is typed `number`. This prevents straightforward DB integration. **Fix**: change `sessionId` to `string`.

### 3. `HomeworkSession` missing required M0-11 fields

M0-11 `session_log` table columns absent from `HomeworkSession`:
- `kid_profile_id` (TEXT FK, NOT NULL) — missing
- `device_tier` (TEXT, NOT NULL) — missing
- `topic` (TEXT, nullable) — missing

`device_tier` is particularly critical: it's a NOT NULL column with a CHECK constraint. **Fix**: add `kidProfileId: string`, `deviceTier: DeviceTier`, and `topic?: string` to `HomeworkSession`.

### 4. No M2 component imports the pipeline types

Acceptance criterion: "Used by at least one existing M2 component (can be via import reference)." Zero imports exist anywhere in the codebase. **Fix**: add at least one type import (even a placeholder `import type { PipelineStage } from '@tutor-sg/shared'`) in an existing M2 component file.

---

## Advisory Issues (not blocking, but should fix)

### 5. Missing `orientation` field on `CameraImage`

Issue scope specifies `HomeworkPhoto` should include `orientation` metadata. `CameraImage` has no `orientation` field. While orientation correction is a pipeline processing step, raw photo orientation is needed upstream (camera preview rotation, correct de-skew input). **Recommend**: add `orientation?: number` (EXIF orientation 1–8).

### 6. Naming drift from issue scope

| Issue scope | Implementation | Risk |
|---|---|---|
| `HomeworkPhoto` | `CameraImage` | Cross-reference confusion |
| `LlmFeedback` | `HomeworkHelp` | Cross-reference confusion |
| `PipelineState` | `PipelineStage` + `PipelineProgress` | The union type was renamed; the progress struct is new. |

Not blocking but creates ambiguity when cross-referencing issue scope. **Recommend**: align names or document the rename rationale.

### 7. Misleading code comment

`types.ts:156` says: "Aligns with the KidSession SQLite schema from M0-11 (mobile/src/storage/sessions.ts)". The file `mobile/src/storage/sessions.ts` does not exist. The actual M0-11 schema is at `packages/database/src/schema.ts`. **Fix**: correct the comment or remove the file-path reference.

---

### 8. `PipelineConfig.freeTierQuestionLimit = 3` has a TBD note

The comment says "TBD by Owl + product testing (ADD §6)" — if this is truly TBD, using a hard default of 3 is fine for the interface, but should be called out as a temporary value.

---

## What Passes

| Check | Status |
|---|---|
| Pipeline flow matches ADD §4.1 | ✅ |
| OCR confidence thresholds (0.6 keep / 0.3 retake) | ✅ |
| `assessOcrQuality()` logic correct | ✅ |
| Model routing table aligns with ADD §3.2 (Gemma for EN/Math/Science, Qwen for Chinese MT) | ✅ |
| Feature gates + capability tiers | ✅ |
| Bilingual i18n (17 en + 17 zh-Hans keys) | ✅ |
| Branch hygiene (feature branch, agent-tagged commits) | ✅ |
| `Locale` import from `i18n/keys` resolves | ✅ |
| `Subject` / `SubjectClassification` imports resolve | ✅ |
| Privacy: no off-device data leaks in type definitions | ✅ |
| `pipeline/index.ts` barrel export | ✅ |
| `packages/shared/src/index.ts` re-exports `./pipeline` | ✅ |

---

## Next Action

Return to Wolf. Fix the 4 blocking issues, then re-request review.

Escalation path if unresolved: second CHANGES REQUESTED → Owl (CTO); third → Foxy (PM).
