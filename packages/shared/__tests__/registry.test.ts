/**
 * Tests for models/registry.ts
 *
 * Covers:
 * - MODEL_REGISTRY contains all expected models
 * - Each entry has required fields
 * - lookupModel() resolves correctly
 * - modelsForTier() returns correct subset
 * - resolveCdnUrl() constructs proper URLs
 * - resolveFallbackCdnUrl() provides fallback
 * - MODEL_INDEX_VERSION is a number
 */

import {
  MODEL_REGISTRY,
  MODEL_INDEX_VERSION,
  SAMPLE_REGISTRY,
  lookupModel,
  modelsForTier,
  resolveCdnUrl,
  resolveFallbackCdnUrl,
} from '../src/models/registry';

describe('MODEL_INDEX_VERSION', () => {
  it('is a positive number', () => {
    expect(typeof MODEL_INDEX_VERSION).toBe('number');
    expect(MODEL_INDEX_VERSION).toBeGreaterThan(0);
  });
});

describe('MODEL_REGISTRY', () => {
  it('contains all 4 expected models', () => {
    const modelIds = MODEL_REGISTRY.map((e) => e.modelId).sort();
    expect(modelIds).toEqual(['gemma-e2b', 'gemma-e4b', 'qwen-2b', 'qwen-4b']);
  });

  it('every entry has modelFamily gemma-4 or qwen-3.5', () => {
    for (const entry of MODEL_REGISTRY) {
      expect(['gemma-4', 'qwen-3.5']).toContain(entry.modelFamily);
    }
  });

  it('every entry has a non-empty sha256 string', () => {
    for (const entry of MODEL_REGISTRY) {
      expect(typeof entry.sha256).toBe('string');
      expect(entry.sha256.length).toBeGreaterThan(0);
    }
  });

  it('every entry has at least one cdnUrl', () => {
    for (const entry of MODEL_REGISTRY) {
      expect(entry.cdnUrls.length).toBeGreaterThanOrEqual(1);
      for (const url of entry.cdnUrls) {
        expect(url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('every entry with fallback URL has cdnUrls.length >= 2', () => {
    const gemmaE2B = MODEL_REGISTRY.find((e) => e.modelId === 'gemma-e2b');
    const gemmaE4B = MODEL_REGISTRY.find((e) => e.modelId === 'gemma-e4b');
    const qwen2B = MODEL_REGISTRY.find((e) => e.modelId === 'qwen-2b');
    const qwen4B = MODEL_REGISTRY.find((e) => e.modelId === 'qwen-4b');
    for (const entry of [gemmaE2B, gemmaE4B, qwen2B, qwen4B]) {
      expect(entry!.cdnUrls.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('sizeBytes is positive for every entry', () => {
    for (const entry of MODEL_REGISTRY) {
      expect(entry.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('every entry has a valid minDeviceTier', () => {
    for (const entry of MODEL_REGISTRY) {
      expect(['low', 'mid', 'high']).toContain(entry.minDeviceTier);
    }
  });
});

describe('SAMPLE_REGISTRY', () => {
  it('is identical to MODEL_REGISTRY', () => {
    expect(SAMPLE_REGISTRY).toBe(MODEL_REGISTRY);
  });
});

describe('lookupModel', () => {
  it('returns the correct entry for gemma-e4b', () => {
    const entry = lookupModel('gemma-e4b');
    expect(entry).toBeDefined();
    expect(entry!.modelFamily).toBe('gemma-4');
    expect(entry!.paramCount).toBe(4);
  });

  it('returns the correct entry for qwen-2b', () => {
    const entry = lookupModel('qwen-2b');
    expect(entry).toBeDefined();
    expect(entry!.modelFamily).toBe('qwen-3.5');
    expect(entry!.paramCount).toBe(2);
  });

  it('returns undefined for unknown modelId', () => {
    expect(lookupModel('nonexistent')).toBeUndefined();
  });
});

describe('modelsForTier', () => {
  it('high tier returns all 4 models', () => {
    const result = modelsForTier('high');
    expect(result).toHaveLength(4);
  });

  it('mid tier returns mid + low models only', () => {
    const result = modelsForTier('mid');
    for (const entry of result) {
      expect(['low', 'mid']).toContain(entry.minDeviceTier);
    }
  });

  it('low tier returns only low models', () => {
    const result = modelsForTier('low');
    for (const entry of result) {
      expect(entry.minDeviceTier).toBe('low');
    }
  });
});

describe('resolveCdnUrl', () => {
  const entry = MODEL_REGISTRY[0];

  it('returns the first absolute URL from cdnUrls', () => {
    const url = resolveCdnUrl(entry);
    expect(url).toBe(entry.cdnUrls[0]);
  });

  it('respects a custom baseUrl', () => {
    const entryWithRelative = { ...entry, cdnUrls: ['gemma-e2b.gguf'] };
    const url = resolveCdnUrl(entryWithRelative, 'https://my-cdn.example/models/');
    expect(url).toBe('https://my-cdn.example/models/gemma-e2b.gguf');
  });
});

describe('resolveFallbackCdnUrl', () => {
  it('returns the second URL when available', () => {
    const entry = MODEL_REGISTRY[1];
    expect(entry.cdnUrls.length).toBeGreaterThanOrEqual(2);
    const fallback = resolveFallbackCdnUrl(entry);
    expect(fallback).toBe(entry.cdnUrls[1]);
  });

  it('generates a sensible fallback when only one URL exists', () => {
    const singleEntry = {
      ...MODEL_REGISTRY[0],
      cdnUrls: ['https://cdn.example.com/models/test.gguf'],
    };
    const fallback = resolveFallbackCdnUrl(singleEntry);
    expect(fallback).toBe('https://cdn2.example.com/models/test.gguf');
  });
});
