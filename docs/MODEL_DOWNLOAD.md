# Model Download — CDN & Integrity Hash Configuration

> **Applies to:** ADD §3.3 (First-launch download), ADD §6.2 (Model integrity)

## Overview

LLM model artifacts are **never bundled** in the app package (keeping it under 50 MB). Instead, on first launch (after parent onboarding), the app downloads required models from a CDN and verifies each file's SHA-256 integrity hash before persisting to local storage.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_CDN_BASE_URL` | `https://cdn.example.com/models/` | Base URL for model artifact downloads. Must end with `/`. |
| `EXPO_PUBLIC_MODEL_INDEX_PATH` | `index.json` | Path to the model manifest JSON, relative to `CDN_BASE_URL`. |

Set these in `.env.local` for local development or via EAS Secrets / CI for staging/production builds.

## Model Manifest (`integrity.json`)

The manifest lives at `packages/shared/src/models/integrity.json` and is the **single source of truth** for:

- List of available models (model ID, family, parameter count, quantisation)
- CDN download URLs (primary + fallback)
- SHA-256 integrity hashes
- File sizes
- Minimum device tier requirements

### Format

```json
{
  "version": 2,
  "entries": [
    {
      "modelId": "gemma-e2b",
      "modelFamily": "gemma-4",
      "paramCount": 2,
      "quant": "q4_0",
      "format": "gguf",
      "sizeBytes": 1395864371,
      "sha256": "abc123...",
      "cdnUrls": [
        "https://cdn.example.com/models/gemma-e2b.gguf",
        "https://cdn2.example.com/models/gemma-e2b.gguf"
      ],
      "minDeviceTier": "mid",
      "recommended": true,
      "notes": "Gemma 4 E2B — mid-tier model. ~1.3 GB."
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `modelId` | string | Canonical model ID matching the LLM routing table. One of: `gemma-e4b`, `gemma-e2b`, `qwen-4b`, `qwen-2b`. |
| `modelFamily` | string | Model family: `gemma-4` or `qwen-3.5`. |
| `paramCount` | number | Parameter count in billions (2 or 4). |
| `quant` | string | Quantisation level: `q4_0`, `q4_k_m`, `q8_0`, or `fp16`. |
| `format` | string | File format: `gguf` or `mlx`. |
| `sizeBytes` | number | Expected file size in bytes. Used for download progress. |
| `sha256` | string | SHA-256 hex digest of the model file. All-zero (`000...`) = placeholder — skip verification in dev. |
| `cdnUrls` | string[] | CDN download URLs. **First = primary**, subsequent entries = fallbacks on failure. |
| `minDeviceTier` | string | Minimum device tier: `low`, `mid`, `high`. |
| `recommended` | bool | If true, this is the recommended model for its tier. |
| `iosOnly` | bool | (optional) If true, iOS-only model. |
| `androidOnly` | bool | (optional) If true, Android-only model. |

### Current model inventory

| Model ID | Family | Params | Quant | Size | Tier | Subjects |
|---|---|---|---|---|---|---|
| `gemma-e2b` | gemma-4 | 2B | q4_0 | ~1.3 GB | mid | English, Math, Science |
| `gemma-e4b` | gemma-4 | 4B | q4_k_m | ~2.5 GB | high | English, Math, Science |
| `qwen-2b` | qwen-3.5 | 2B | q4_0 | ~1.2 GB | mid | Chinese Mother Tongue |
| `qwen-4b` | qwen-3.5 | 4B | q4_k_m | ~2.4 GB | high | Chinese Mother Tongue |

## URL Resolution Strategy

1. The downloader reads the manifest entry's `cdnUrls` array.
2. It tries **`cdnUrls[0]`** first (primary CDN).
3. On failure (network error, HTTP 5xx, timeout), it falls back to **`cdnUrls[1]`** (secondary CDN).
4. If all URLs fail, the download errors and the user sees a retry prompt.

The base URL (`CDN_BASE_URL`) can be overridden via `EXPO_PUBLIC_CDN_BASE_URL`. If the registry entry's URLs are relative, they are resolved against `CDN_BASE_URL`.

## Integrity Verification

### Flow

1. **Download** — file is streamed to a temporary location using `expo-file-system`.
2. **Hash** — SHA-256 is computed over the downloaded bytes.
3. **Compare** — computed hash is compared against the manifest `sha256` field.
4. **Placeholder check** — if `sha256` is all-zero (`000...000`), the verification is **skipped** (dev/staging mode). This allows development without real model files.
5. **Pass** — file is moved to permanent storage (`{documentDirectory}/models/`).
6. **Fail** — corrupt temp file is deleted, download is retried once. On second failure, user sees an error message and a "Retry" button.

### Computing real hashes

When you have the actual model `.gguf` files:

```bash
# Place model files in a staging directory
mkdir -p /tmp/model-staging
cp path/to/gemma-e2b.gguf /tmp/model-staging/

# Compute hashes and update integrity.json
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json

# Review the diff before committing
git diff packages/shared/src/models/integrity.json
```

The script (`scripts/compute-model-hashes.ts`) computes SHA-256 and file size for each `.gguf`/`.mlx` file found in the target directory. The `--json` flag writes directly to `packages/shared/src/models/integrity.json`.

### Verification in the downloader

The downloader (`mobile/src/services/modelDownload.ts`) handles hash verification as follows:

```typescript
async function verifyIntegrity(filePath: string, expectedHash: string): Promise<boolean> {
  // Skip verification for placeholder hashes (all zeros)
  if (/^0+$/.test(expectedHash)) return true;

  const computed = await computeSha256(filePath);
  return computed === expectedHash;
}
```

## Fallback CDN Configuration

Each registry entry supports multiple CDN URLs. The **first URL** is the primary, the **second** is the failover. This supports mirror setups for reliability.

If no explicit fallback URL is provided, the code automatically generates one by swapping `cdn.example.com` -> `cdn2.example.com` in the primary URL.

## Adding a New Model

1. **Register** — Add a new entry to `packages/shared/src/models/integrity.json`.
2. **Host** — Upload the model file to your CDN (primary + fallback).
3. **Hash** — Run `scripts/compute-model-hashes.ts` and update the `sha256` value.
4. **Route** — If this is a new model family, add a new routing entry in `packages/llm/src/routing.ts`.
5. **Deploy** — Update the CDN model index and ship an app update.

## Model Version Upgrades

When CDN `integrity.json` version increments:

1. New models download in the background (non-blocking).
2. After verification, old model is swapped atomically on next cold launch.
3. Old files deleted after successful swap.

This is handled by the model download service (`mobile/src/services/modelDownload.ts`).

## Related Files

| File | Purpose |
|---|---|
| `packages/shared/src/models/integrity.json` | Model manifest — single source of truth |
| `packages/shared/src/models/registry.ts` | Runtime registry with lookup helpers |
| `packages/shared/src/schema/registry.ts` | TypeScript types for registry entries |
| `scripts/compute-model-hashes.ts` | CLI script to compute SHA-256 hashes |
| `mobile/src/services/modelDownload.ts` | Download service with integrity verification |
| `mobile/app.config.ts` | Expo config that passes env vars to the app |
| `packages/shared/src/config/env.ts` | Environment config parser (Zod schema) |
| `.env.example` | Example env vars |

## References

- [ADD §3.3 — First-launch download](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/docs/ARCHITECTURE.md#35-first-launch-model-download)
- [ADD §6.2 — Model integrity](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/docs/ARCHITECTURE.md#62-model-integrity)
