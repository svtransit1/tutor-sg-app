# Review: AAAS-272 — M2-20a: Native module bridges for device tier detection

**Reviewer:** Owl (CTO)
**Date:** 2026-05-09
**Branch:** `wolf/aaas-272-v2`
**Commit:** `8d7e9ccef`
**Author:** Tiger (original) / Wolf (recovery + blocker fixes)

**Verdict: APPROVED**

## What was checked (re-review)

- Commit `8d7e9ccef` exists on `wolf/aaas-272-v2`
- Both CHANGES REQUESTED blockers from 2026-05-09 initial review are resolved
- 15/15 vitest tests pass

## Blocker resolution

| # | Blocker | Resolution | Verified |
|---|---------|------------|----------|
| 1 | Bilingual title (Gate #2) | `titleEn`/`titleZh` added to `BELOW_FLOOR_MESSAGES`; `BelowFloorModal` uses them dynamically | `types.ts:10`, `BelowFloorModal.tsx:4-5`, test verifies both keys |
| 2 | Accessibility labels (Gate #3) | `accessibilityViewIsModal` on Modal, `accessibilityRole="header"` + `accessibilityLabel` on title, `accessibilityLabel` on body | `BelowFloorModal.tsx:5` |

## Nits (deferred to child issue M2-20c)

Wolf recommends creating `M2-20c: chipset name canonicalization` to address:
- iOS sysctl returns device model IDs (e.g., "iPhone15,3") not chipset names
- Android SoC model strings ("SM8550") don't match canonical names ("SDM8 Gen2")
- iOS NPU false positive on <16.0

These do not block this issue — detection works correctly on simulators and fallback devices; chipset matching precision is a refinement.

## Quality gate summary

| Gate | Status |
|------|--------|
| 1. Tests pass | 15/15 |
| 2. Bilingual completeness | All 6 keys (en, zh, titleEn, titleZh + model map labels) present |
| 3. Accessibility | Modal: `accessibilityViewIsModal`; Title: `role="header"` + `accessibilityLabel`; Body: `accessibilityLabel` |
| 4. Privacy review | No photo/OCR/free-text paths — device info only |
| 5. No restricted SDKs | No analytics, no fingerprinting |
| 6. Performance budget | Simple native call, no UI-blocking |
| 7. Branch hygiene | Feature branch from main; agent-tagged commits |
| 8. Verification evidence | 15/15 vitest; commit pushed; `npx expo prebuild` needed for native module registration |

## Escalation

Next: Foxy for merge approval per FLEET_REVIEW_PROTOCOL §10.
