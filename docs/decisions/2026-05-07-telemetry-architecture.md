# Telemetry Architecture — Onboarding Funnel Events

**Date:** 2026-05-07  
**Owner:** Bee (Mobile Coder #2)  
**Issue:** AAAS-234 (M2-45)  
**Status:** locked  

## Context

Per Onboarding Dev Spec (§6), the onboarding funnel must emit typed analytics events for the following screens: lang pick, grade pick, subject pick, sibling prompt, device tier sniff, permission primers, model download lifecycle, and completion. The same spec also requires **opt-in by default** (AC #9: "No telemetry events fire before parent opts in") and that **no data leaves the device** (AC #12).

## Architecture decisions

| Decision | Rationale |
|---|---|
| **Module lives in `mobile/src/services/telemetry/`** | Mobile-only client concern; not shared logic. |
| **MMKV for local event buffer** | Already a dependency in `mobile/package.json`. Faster than AsyncStorage. Supports JSON serialization. |
| **Opt-in default (`denied`)** | `telemetryConsent` defaults to `'denied'`. `trackEvent()` is a no-op unless consent is `'granted'`. Revoking consent drains the buffer. |
| **Typed discriminated union via Zod** | Every event has its own Zod schema. The union `telemetryEventSchema` provides compile-time exhaustiveness and runtime validation. Zod is already in the dependency tree. |
| **`flush()` is a no-op in M2** | Ready for M3+ analytics sink (Supabase / PostHog). When wired, `flush()` will drain the buffer and POST to the endpoint. |
| **FIFO buffer capped at 1000 events** | Prevents unbounded storage bloat. Oldest events dropped first. |

## File structure

```
mobile/src/services/telemetry/
├── types.ts          — Zod schemas & TypeScript types for all 12 events
├── storage.ts        — MMKV-backed append/read/drain/clear + consent persistence
├── index.ts          — Public API: trackEvent, setTelemetryConsent, getTelemetryConsent, flush
└── __tests__/
    └── index.test.ts — 15 tests covering opt-in, buffering, overflow, flush, storage ops
```

## Defined events (per §6)

- `onboarding_lang_picked` — lang (en | zh-Hans)
- `onboarding_grade_picked` — grade (P1–P6)
- `onboarding_subjects_picked` — subjects[] 
- `onboarding_sibling_added` — count
- `onboarding_device_tier` — tier (high | low | unsupported)
- `onboarding_perm_camera` — granted
- `onboarding_perm_notif` — granted
- `onboarding_download_started` — tier, bytes
- `onboarding_download_completed` — duration_sec, bytes, retries
- `onboarding_download_failed` — reason
- `onboarding_completed` — total_duration_sec
- `first_camera_open_after_onboarding` — latency_sec

## Verification

- ✅ 37/37 tests pass (15 new + 22 existing)
- ✅ Zero type errors in telemetry module
- ✅ All 12 event types constructable and bufferable
- ✅ Opt-in guard: no events stored when consent is `denied`
- ✅ Consent revocation drains buffer
- ✅ FIFO eviction at 1000 events
- ✅ `flush()` no-op resolves without error
