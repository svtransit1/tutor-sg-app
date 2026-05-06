# Review: in_review Branch Audit (2026-05-06)

**Reviewer:** Tortoise
**Date:** 2026-05-06
**Scope:** All 8 issues with status=in_review

## Result: CHANGES REQUESTED (all issues)

### Summary

All 8 in_review issues fail verification due to one or more of:
1. No implementation branch exists
2. Branch not pushed to remote
3. Implementation incomplete (scaffolding only, no actual code)
4. Heavy branch bundling — commits from 5+ unrelated issues mixed together

---

### Per-Issue Findings

#### AAAS-127: M2-11 On-device LLM runtime (Wolf)
**Branch:** `wolf/aaas-127-litert-native-module` (local only, not pushed)
**Status:** INCOMPLETE

- Branch contains 3 commits: AAAS-20 (pnpm), AAAS-21 (ts-strict), AAAS-29 (model registry)
- Zero LiteRT-LM native module code on the branch
- `mobile/src/llm/` in working tree has only type definitions (llm.types.ts, modelRouting.ts) and one empty test
- Missing: iOS .h/.m native module, Android .kt native module, expo-plugin config, JS bridge (LitertModule.ts), streaming generate() implementation
- **Blocker:** No actual implementation exists on the branch

#### AAAS-128: M2-12 OCR pipeline (Bee)
**Branch:** NONE found
**Status:** NO BRANCH

- `mobile/modules/tutor-sg-ocr/` exists in working tree (untracked, not on any branch)
- No remote or local branch dedicated to AAAS-128
- **Blocker:** No branch to review

#### AAAS-134: M2-16 MOE Math syllabus topic tree (agent adb6a4d8)
**Branch:** NONE found
**Status:** NO BRANCH

- No syllabus content files found anywhere in the repo
- Previous commit `2c8dde1` on feat/aaas-130-session-persistence referenced AAAS-134 but was overwritten during branch recreation
- **Blocker:** No branch to review

#### AAAS-39: M2-2 Device-tier detection (Owl)
**Branch:** `origin/feat/aaas-39-device-tier-detection`
**Status:** IMPLEMENTATION OK, BRANCH HYGIENE FAILS

**Code quality (GOOD):**
- Proper 3-tier classification (high/mid/low) with RAM + NPU + thermal + storage factors
- Comprehensive chipset tables (Apple A14-A19, M1-M4, Qualcomm SD8 series, MediaTek Dimensity, Google Tensor, Samsung Exynos)
- iOS model-to-RAM mapping with fallback to DeviceInfo.getTotalMemory()
- Pure classification logic in shared/ with provider pattern on mobile/
- Unit tests cover all tier branches, boundary values, and edge cases

**Issues:**
- Branch contains 11+ commits spanning AAAS-25, AAAS-41, AAAS-43, AAAS-44, AAAS-45, AAAS-46
- Cannot isolate AAAS-39 changes for clean merge
- **Fix needed:** Create clean branch from main with only AAAS-39 commits

#### AAAS-46: M2-9 E2E Maestro flow (Parrot)
**Branch:** `origin/aaas-46/e2e-maestro-flow`
**Status:** IMPLEMENTATION PARTIAL, BRANCH HYGIENE FAILS

- Has E2E test scaffolding (AAAS-25) and Maestro flow commit
- Has review-fix commit (corrected appId)
- Branch also contains unrelated commits
- **Fix needed:** Clean branch isolation

#### AAAS-43: M2-6 Homework camera capture (Bee)
**Branch:** `origin/feat/aaas-43-camera-capture`
**Status:** IMPLEMENTATION PARTIAL, BRANCH HYGIENE FAILS

- Multiple camera commits: single-photo capture, preview+retake, flash toggle, document scanner
- Also bundled with AAAS-41, AAAS-44, AAAS-45, AAAS-46 commits
- **Fix needed:** Clean branch isolation

#### AAAS-22: M0-10 shared/ package skeleton (Owl)
**Branch:** NONE dedicated
**Status:** NO BRANCH

- Shared package changes are scattered across other branches
- `packages/shared/src/` has schema/registry.ts, deviceTier.ts, models/session.ts, models/integrity.json
- No single branch consolidates the shared/ package skeleton
- **Fix needed:** Create dedicated branch

#### AAAS-45: M2-8 Onboarding state machine + persistence (Owl)
**Branch:** NONE dedicated
**Status:** NO BRANCH

- Commit `f13e1d0` exists on the device-tier-detection branch but is bundled
- **Fix needed:** Create dedicated branch

---

### Root Cause: Branch Bundling

All branches contain commits from multiple unrelated issues. This violates the per-issue branch hygiene rule. The worst offender is `feat/aaas-39-device-tier-detection` which contains commits for at least 7 different issues.

### Recommended Actions

1. **Owl:** Create clean branch for AAAS-39 (device-tier) and AAAS-22 (shared package)
2. **Wolf:** Implement actual LiteRT-LM native module and push to AAAS-127 branch
3. **Bee:** Push AAAS-128 OCR branch; create clean AAAS-43 camera branch
4. **Parrot:** Create clean AAAS-46 Maestro branch
5. **Agent adb6a4d8:** Create AAAS-134 syllabus branch
6. **Foxy:** Adjudiate — all 8 issues should be moved back to `in_progress` until clean branches exist
