# Model Versioning + CDN Delivery Strategy

**Date:** 2026-05-09
**Context:** AAAS-968 — M0-84: ARCHITECTURE.md §5
**Status:** locked

## Decision

Model files are hosted on Cloudflare R2 with signed URLs, versioned with semantic versioning (MAJOR.MINOR.PATCH), and delivered via an `index.json` manifest. The app downloads models on first launch, applies delta patches for non-breaking updates, and swaps models atomically for crash-safety.

## Key architecture choices

| Choice | Rationale |
|---|---|
| Cloudflare R2 with signed URLs | Low-cost object storage with global edge caching; signed URLs prevent hotlinking without requiring user auth on CDN |
| Semantic model versioning | Models are binary artifacts — MAJOR bumps for format breaks, MINOR for quality, PATCH for fixes |
| `index.json` manifest as source of truth | Single endpoint for app to discover available versions, deltas, and hashes; ETag-conditional for bandwidth efficiency |
| xdelta3 for delta patches | Fast, open-source, proven on large binaries; fallback to full download when delta >70% of full size |
| Atomic swap via filesystem rename + SQLite intent | Crash-safe: APFS/ext4 rename is atomic; SQLite intent row survives kills; rollback path is delete-pending + retry |
| Wi-Fi gating for >100 MB downloads | Respects user data plans; overridable in Settings |
| SHA-256 integrity on every file | Required before loading any model into inference engine; one retry on mismatch |

## Constraints for implementers

1. Never hardcode model URLs — always resolve from `index.json`
2. Never bundle model files in the app package (app must stay <50 MB)
3. Never delete the active model before the pending model passes integrity check
4. All user-facing download strings must have EN + zh-Hans-SG counterparts
5. Model version compatibility is declared in `app.config.ts` via `MODEL_VERSION_CONTRACT`

## Cross-references

- **Full spec:** `docs/ARCHITECTURE.md` §5
- **First-launch flow:** `docs/ARCHITECTURE.md` §3.5
- **Security overview:** `docs/ARCHITECTURE.md` §7.2
- **ADD §3.3:** Delivery — first-launch download
