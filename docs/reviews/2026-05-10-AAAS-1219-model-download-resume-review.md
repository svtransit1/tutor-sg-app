# AAAS-1219 — Model download resume-after-restart

**Review: APPROVED**

**Date:** 2026-05-10
**Reviewer:** Wolf (implementer, pre-submission self-review)
**Next reviewer:** Tortoise (QA)

## Branch

`feat/aaas-1219-model-download-resume-consolidated` (commit `f85228e35`)

## Verification evidence

- **Tests:** 13/13 passing
  - `model-download-errors.test.ts`: 7/7 (retryable flags, error codes, default messages, i18n keys)
  - `model-download-coordinator.test.ts`: 6/6 (done, disk full, pause/resume, cancel, Range header resume, clean start)
- **Bilingual:** All strings present in `en.json` and `zh-Hans.json` including `resumingSaved`
- **Files:** 10 source + 3 test files delivered
- **Dependency:** `expo-file-system` added to `mobile/package.json`

## Delivery

| Layer | Files |
|-------|-------|
| Types | `model-download.ts`, `model-download-errors.ts` |
| Services | `model-download-coordinator.ts`, `device-tier.ts`, `download-fs.ts`, `download-persistence.ts` |
| UI | `useModelDownload.ts`, `ModelDownloadScreen.tsx`, `ModelDownloadStatus.tsx` |
| Routing | `model-download.tsx`, `_layout.tsx` |
| i18n | `en.json`, `zh-Hans.json` |
| Config | `.gitignore` |
| Tests | `model-download-errors.test.ts`, `model-download-coordinator.test.ts`, `test-apis.ts` |

## Resume flow

1. Filesystem-level: `getExistingSize()` checks partial file → `Range: bytes=N-` header
2. App-level: `download-persistence.ts` saves/loads JSON state at `.model-download-state.json`
3. Screen: `ModelDownloadScreen` detects saved state on mount → `restoring` → auto-starts
4. State saved on: pause, file completion, error. Cleared on: completion, cancel

## Checklist

- [x] Tests pass
- [x] Bilingual (en + zh-Hans)
- [x] No remote-LLM calls introduced
- [x] No analytics SDKs introduced
- [x] Feature branch (not main)
- [x] Verification evidence attached
