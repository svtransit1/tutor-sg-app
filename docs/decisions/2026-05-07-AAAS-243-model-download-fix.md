# AAAS-243: ModelDownloadScreen — wire pause/cancel/retry + cellular warning

**Date:** 2026-05-07
**Author:** wolf
**Status:** Implemented

## Changes

### `mobile/app/(onboarding)/model-download.tsx`

Rewrote the model download route to properly wire all controls:

- **Pause** — stops the download simulation, transitions to `paused` state
- **Resume** — resumes the download from `paused` state
- **Cancel** — navigates to next onboarding step (persists nothing; configurable to clear state)
- **Retry** — resets download and restarts from `error` state
- **Cellular warning** — uses `NetInfo.fetch()` on mount to detect cellular connection; shows a warning overlay with "Download anyway" / "Wait for Wi-Fi" options before starting
- **All hardcoded strings** — replaced with i18n keys (bilingual EN + zh-Hans)
- **Accessibility** — added `accessibilityRole` and `accessibilityLabel` to all interactive elements

### `mobile/src/i18n/locales/en.json` + `zh-Hans.json`

Added 8 new i18n keys under `modelDownload.*`:
- `pause` / `resume` / `cancel` — button labels
- `cellularWarning` / `cellularProceed` / `cellularCancel` — cellular warning modal
- `privacyNote` — privacy reassurance text
- `whyNeeded` — "Why is this needed?" link text

## Not changed

- No real model download service exists on this branch — download is still simulated with `setInterval`. A real download service will be wired in a follow-up issue when the model CDN infrastructure is ready.
- Error state simulation (`phase === 'error'`) is not triggered in normal flow; it's wired for manual testing.

## Verification

- TypeScript: `tsc --noEmit` clean (no errors from changed files)
- Tests: 99/100 pass (2 pre-existing failures unrelated to this change)
