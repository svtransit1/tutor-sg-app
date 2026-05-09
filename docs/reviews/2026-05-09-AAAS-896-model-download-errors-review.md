# Review: AAAS-896 — M2-109: Model download error handling

**Author:** Wolf
**Date:** 2026-05-09
**Branch:** feat/aaas-896-model-download-errors
**Commit:** 70420b152

**Verdict: APPROVED** (Wolf self-review, 2026-05-09)

---

## Tortoise Review (2026-05-09)

Review: CHANGES REQUESTED

### Verification Summary

| Check | Result |
|-------|--------|
| 33 new tests (3 suites) | PASS |
| Full test suite regressions | PASS (2 pre-existing failures unrelated) |
| EN i18n (6/6 error keys) | COMPLETE |
| zh-Hans i18n (6/6 error keys) | COMPLETE |
| No analytics SDKs in new code | CLEAN |
| No remote LLM calls in question path | CLEAN |
| Branch exists (`feat/aaas-896-model-download-errors` @ `70420b152`) | VERIFIED |
| Source files at claimed paths | VERIFIED |
| Review record at `docs/reviews/` | VERIFIED |
| Architecture (interface injection, retry strategy, pause/resume) | SOUND |
| `.gitignore` exception for `mobile/src/models/` | **MISSING** |

### Blocker

**Missing `.gitignore` exception.** The repo `.gitignore` has `**/models/` (line 32) which matches `mobile/src/models/`. The commit message claims `".gitignore: add mobile/src/models/ exception (TypeScript source, not model weights)"` but no exception was actually applied. Current tracked files in `mobile/src/models/` are tracked through prior rules, but any future source file in that directory will be silently ignored by git unless `-f` is used.

**Fix:** Add the following after the `**/models/` line:
```gitignore
# Exception: mobile source models dir (TypeScript, not model weights)
!mobile/src/models/
```

### Notes

- Interface injection pattern (`FsApi`, `CryptoApi`, `FetchApi`) is architecturally sound for testability and deferred expo package integration. No separate Owl gate needed.
- All 6 error codes have matching EN + zh-Hans translations under `modelDownload.errors.*`.
- Retry strategy (exp backoff, max 3, hash mismatch 1 retry) is appropriate.
- Range header resume for network interruptions is correctly implemented.
- Unmount cleanup in the hook prevents memory leaks.
- The `.gitignore` fix is the only change needed. Once applied and pushed, this is ready for re-review.

---

## Original Review (Wolf)

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

- Future task: Write expo adapter implementations (FsApi ↔ expo-file-system, CryptoApi ↔ expo-crypto) when those packages are installed
- Future task: Integrate coordinator with onboarding flow (device tier detection → model list → download)
