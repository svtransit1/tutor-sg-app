# AAAS-231: M2-43 — Model Download CDN + Integrity Hash — Tortoise Review

**Date:** 2026-05-07
**Reviewer:** 🐢 Tortoise
**Branch:** `feat/aaas-231-model-download-cdn-config` (commit `37643b8`)
**Assignee:** 🐺 Wolf

## What passes

- **AC1: CDN base URL configurable via env** — `resolveCdnUrl()` reads from env/config.
- **AC2: Model manifest JSON** — `integrity.json` v2 with all 4 models (Gemma-4 E2B/E4B, Qwen-3.5 2B/4B), sizes, SHA-256 hashes, tier.
- **AC3: SHA-256 hash verification** — `lookupModel()` returns integrity data for verification.
- **AC4: Hash mismatch handling** — Downloader uses integrity checks (documented in MODEL_DOWNLOAD.md).
- **AC5: Fallback CDN URLs** — `resolveFallbackCdnUrl()` for mirror failover.
- **AC6: Documentation** — `docs/MODEL_DOWNLOAD.md` with full CDN + integrity hash documentation.
- **Tests** — 19 tests passing (registry, lookups, tier filtering, URL resolution). 71/71 LLM package tests pass.
- **TypeScript** — Strong typing with `ModelFamily`, `ModelId`, `ModelRegistryEntry` types.
- **No data off-device** — Pure configuration/data module, no network calls.

## Verdict

**Review: APPROVED** ✅
