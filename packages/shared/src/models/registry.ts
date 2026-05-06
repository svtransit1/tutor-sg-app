/**
 * Model Registry — runtime model catalog derived from integrity.json.
 *
 * This file is the single source of truth for which models are available,
 * their download URLs (primary + fallback), expected sizes, and SHA-256
 * integrity hashes.
 *
 * ## Adding a new model variant
 *
 * 1. Add the model file to your CDN (Cloudflare R2 or equivalent).
 * 2. Run `npx tsx scripts/compute-model-hashes.ts /tmp/model-staging` to get
 *    the SHA-256 and sizeBytes values.
 * 3. Update `integrity.json` with the new entry.
 * 4. If a new `modelFamily` or `quant` value is needed, update the schema
 *    in `src/schema/registry.ts` first.
 * 5. Verify with the shared package type check: `npx tsc --noEmit`.
 * 6. Increment the `version` field in `integrity.json`.
 * 7. For breaking changes (deleted/renamed model files), update `MODEL_INDEX_VERSION`.
 */

import type { ModelRegistryEntry, ModelRegistry } from '../schema/registry';
import integrityManifest from './integrity.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Version of the model index format. Increment on breaking changes. */
export const MODEL_INDEX_VERSION: number = integrityManifest.version ?? 1;

/**
 * Validate and cast JSON entries to typed registry.
 * Note: resolveJsonModule infers JSON values as plain `string`, so we assert
 * with a runtime validation helper to ensure type safety.
 */
function parseRegistry(entries: unknown[]): ModelRegistry {
  return entries.map((e) => {
    const raw = e as Record<string, unknown>;
    if (typeof raw.modelId !== 'string') {
      throw new Error(`Invalid modelId in integrity.json entry: ${JSON.stringify(raw)}`);
    }
    return raw as unknown as ModelRegistryEntry;
  });
}

/** Full model registry — typed and ready for use. */
export const MODEL_REGISTRY: ModelRegistry = parseRegistry(integrityManifest.entries);

/** Alias for backward compatibility with early downloader code. */
export const SAMPLE_REGISTRY: ModelRegistry = MODEL_REGISTRY;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Look up a single model registry entry by its canonical model ID.
 * Returns undefined if not found.
 */
export function lookupModel(modelId: string): ModelRegistryEntry | undefined {
  return MODEL_REGISTRY.find((e) => e.modelId === modelId);
}

/**
 * Filter registry entries by minimum device tier.
 * Returns models whose `minDeviceTier` is ≤ the given tier.
 *
 * Tier order: low (0) < mid (1) < high (2).
 */
export function modelsForTier(tier: 'low' | 'mid' | 'high'): ModelRegistry {
  const tierOrder: Record<string, number> = { low: 0, mid: 1, high: 2 };
  const tierVal = tierOrder[tier] ?? 0;
  return MODEL_REGISTRY.filter((e) => (tierOrder[e.minDeviceTier] ?? 0) <= tierVal);
}

// ---------------------------------------------------------------------------
// URL resolution
// ---------------------------------------------------------------------------

/**
 * Construct a full CDN download URL for a model entry.
 *
 * If the registry entry has absolute URLs in `cdnUrls`, those are used directly.
 * Otherwise, the URL is constructed as `{baseUrl}{entry.modelId}.gguf`.
 *
 * @param entry - The model registry entry.
 * @param baseUrl - Optional CDN base URL (defaults to placeholder).
 * @returns The primary download URL.
 */
export function resolveCdnUrl(
  entry: ModelRegistryEntry,
  baseUrl?: string,
): string {
  if (entry.cdnUrls.length > 0 && entry.cdnUrls[0]?.startsWith('http')) {
    return entry.cdnUrls[0]!;
  }
  const base = baseUrl ?? 'https://cdn.example.com/models/';
  const baseNormalized = base.endsWith('/') ? base : base + '/';
  return `${baseNormalized}${entry.modelId}.gguf`;
}

/**
 * Resolve the fallback CDN URL for a model entry.
 * Falls back to swapping the hostname in the primary URL.
 */
export function resolveFallbackCdnUrl(
  entry: ModelRegistryEntry,
  primaryUrl?: string,
): string {
  if (entry.cdnUrls.length > 1) {
    return entry.cdnUrls[1]!;
  }
  // If no fallback, try swapping cdn.example.com → cdn2.example.com
  const url = primaryUrl ?? resolveCdnUrl(entry);
  return url.replace('cdn.example.com', 'cdn2.example.com');
}
