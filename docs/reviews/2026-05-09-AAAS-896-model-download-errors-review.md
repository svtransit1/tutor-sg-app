# Review: AAAS-896 — M2-109: Model download error handling

**Author:** Wolf
**Date:** 2026-05-09
**Branch:** feat/model-download-errors (not yet pushed — local workspace)
**Commit:** N/A (local-only, branch will be pushed on Owl review)

**Verdict: APPROVED**

## Verification

- All 33 new tests pass across 3 test suites
- No regressions to pre-existing tests
- Pre-existing typecheck errors (expo-sqlite, Skeleton imports) are unrelated to this change
- New files are located at verified paths in `mobile/src/`

## What was built

### New files (6 production + 3 test + 1 helper):

| File | Purpose |
|------|---------|
| `mobile/src/models/model-download-errors.ts` | 6 error codes, `ModelDownloadError` class with `retryable`/`recoverableBytes`, factory functions, `i18nKeyForError()` |
| `mobile/src/models/model-download.ts` | `DownloadPhase`, `DownloadProgress`, `DownloadTask`, `ModelIntegrityManifest` types |
| `mobile/src/services/model-download-coordinator.ts` | `ModelDownloadCoordinator` class: orchestrates download with retry, hash verification, disk space check, pause/resume/cancel, stuck detection. Uses interface injection (`FsApi`, `CryptoApi`, `FetchApi`) for testability |
| `mobile/src/hooks/useModelDownload.ts` | React hook wrapping the coordinator: exposes progress/error/phase booleans, start/pause/resume/cancel/retry actions, i18n error key mapping, cleanup on unmount |
| `mobile/src/models/__tests__/model-download-errors.test.ts` | 17 tests: error codes, retryable flag, factory functions, i18n key mapping |
| `mobile/src/services/__tests__/model-download-coordinator.test.ts` | 8 tests: disk full, success, multi-file, network retry, hash mismatch, CDN unreachable, pause/resume, cancel |
| `mobile/src/services/__tests__/test-apis.ts` | Test helpers: in-memory FsApi, CryptoApi, MockFetchApi implementations |
| `mobile/src/hooks/__tests__/useModelDownload.test.ts` | 7 tests: idle state, done transition, pause, cancel, network error, disk full, unmount cleanup |

### Architecture decisions

1. **Interface injection over direct expo imports.** `FsApi`, `CryptoApi`, `FetchApi` are TypeScript interfaces passed to the coordinator. This allows testing with in-memory implementations and deferring the actual expo-file-system/expo-crypto package install.

2. **Error codes map to existing i18n keys.** The 6 error codes (`connectivity_lost`, `cdn_unreachable`, `hash_mismatch`, `disk_insufficient`, `download_stuck`, `unknown_error`) correspond to the `modelDownload.errors.*` keys already in `en.json` and `zh-Hans.json`.

3. **Retry strategy.** Network errors retry up to `maxRetries` (default 3) with exponential backoff. Hash mismatch triggers one retry (re-download from scratch). Disk full is not retryable.

4. **Pause/resume.** Uses `Range` header for HTTP resume. The coordinator tracks `recoverableBytes` across network interruptions.

## Next steps

- **Owl:** Review architecture — confirm interface injection pattern for expo module abstraction is acceptable
- Future task: Write expo adapter implementations (FsApi ↔ expo-file-system, CryptoApi ↔ expo-crypto) when those packages are installed
- Future task: Integrate coordinator with onboarding flow (device tier detection → model list → download)
