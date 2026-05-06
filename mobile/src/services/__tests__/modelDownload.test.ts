/**
 * Unit tests for the model-download service.
 *
 * Covers:
 * - selectModelsForTier (tier gating, platform filtering, ordering)
 * - createDownloadSession (session initialization)
 * - getProgress (progress computation)
 * - formatModelName / formatBytes (display helpers)
 * - pickCdnUrl (URL selection)
 * - Session persistence (save / load / clear)
 * - Edge cases (empty registry, invalid tier)
 */

import {
  selectModelsForTier,
  createDownloadSession,
  getProgress,
  formatModelName,
  formatBytes,
  pickCdnUrl,
  saveSessionState,
  loadSessionState,
  clearSessionState,
  type DownloadSessionState,
} from '../modelDownload';
import type { ModelRegistryEntry, ModelRegistry, DeviceTier } from '@tutor-sg/shared';
import { SAMPLE_REGISTRY } from '@tutor-sg/shared';

// Jest auto-mock for @react-native-async-storage/async-storage
// (configured in jest.config.js moduleNameMapper)

// ── Helpers ────────────────────────────────────────────────────────

/** Make a minimal registry entry for testing. */
function entry(overrides: Partial<ModelRegistryEntry> = {}): ModelRegistryEntry {
  return {
    modelFamily: 'gemma-3',
    paramCount: 2,
    quant: 'q4_k_m',
    format: 'gguf',
    sizeBytes: 1_000_000_000,
    sha256: 'a'.repeat(64),
    cdnUrls: ['https://cdn.example.com/test.gguf'],
    minDeviceTier: 'low',
    ...overrides,
  };
}

function makeRegistry(entries: ModelRegistryEntry[]): ModelRegistry {
  return entries;
}

// ── selectModelsForTier ───────────────────────────────────────────

describe('selectModelsForTier', () => {
  it('high tier includes both low and mid gated models', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', modelFamily: 'gemma-2', paramCount: 2, sizeBytes: 500 }),
      entry({ minDeviceTier: 'mid', modelFamily: 'gemma-3', paramCount: 4, sizeBytes: 2_000 }),
    ]);
    const selected = selectModelsForTier('high', reg);
    expect(selected).toHaveLength(2);
  });

  it('mid tier includes mid-gated models but not high-gated', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', sizeBytes: 500 }),
      entry({ minDeviceTier: 'mid', sizeBytes: 1_000 }),
      entry({ minDeviceTier: 'high', sizeBytes: 2_000 }),
    ]);
    const selected = selectModelsForTier('mid', reg);
    expect(selected).toHaveLength(2);
    expect(selected.every((e) => e.minDeviceTier !== 'high')).toBe(true);
  });

  it('low tier only includes low-gated models', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', sizeBytes: 500 }),
      entry({ minDeviceTier: 'mid', sizeBytes: 1_000 }),
    ]);
    const selected = selectModelsForTier('low', reg);
    expect(selected).toHaveLength(1);
    expect(selected[0]!.minDeviceTier).toBe('low');
  });

  it('filters out androidOnly entries on iOS (global mock is iOS)', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', androidOnly: true }),
      entry({ minDeviceTier: 'low', iosOnly: false }),
    ]);
    const selected = selectModelsForTier('high', reg);
    expect(selected.every((e) => !e.androidOnly)).toBe(true);
  });

  it('sorts recommended entries first', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', recommended: false, sizeBytes: 500 }),
      entry({ minDeviceTier: 'low', recommended: true, sizeBytes: 1_000 }),
    ]);
    const selected = selectModelsForTier('high', reg);
    expect(selected[0]!.recommended).toBe(true);
    expect(selected[1]!.recommended).toBe(false);
  });

  it('sorts by size within same recommendation tier', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'low', recommended: true, sizeBytes: 2_000 }),
      entry({ minDeviceTier: 'low', recommended: true, sizeBytes: 500 }),
    ]);
    const selected = selectModelsForTier('high', reg);
    expect(selected[0]!.sizeBytes).toBe(500);
    expect(selected[1]!.sizeBytes).toBe(2_000);
  });

  it('returns empty array when no models match', () => {
    const reg = makeRegistry([
      entry({ minDeviceTier: 'mid' }),
    ]);
    const selected = selectModelsForTier('low', reg);
    expect(selected).toHaveLength(0);
  });

  it('works with SAMPLE_REGISTRY for all tiers', () => {
    // SAMPLE_REGISTRY has 2B (low) and 4B (mid) — both recommended
    const high = selectModelsForTier('high', SAMPLE_REGISTRY);
    expect(high.length).toBeGreaterThanOrEqual(1);

    const mid = selectModelsForTier('mid', SAMPLE_REGISTRY);
    expect(mid.length).toBeGreaterThanOrEqual(1);

    const low = selectModelsForTier('low', SAMPLE_REGISTRY);
    expect(low.length).toBeGreaterThanOrEqual(1);
    // low tier should not get the 4B model (minDeviceTier: 'mid')
    expect(low.every((e) => e.minDeviceTier === 'low')).toBe(true);
  });
});

// ── createDownloadSession ─────────────────────────────────────────

describe('createDownloadSession', () => {
  it('creates a session with correct count of models', () => {
    const session = createDownloadSession('high');
    expect(session.models.length).toBeGreaterThan(0);
  });

  it('initializes all models as idle', () => {
    const session = createDownloadSession('high');
    expect(session.models.every((m) => m.status === 'idle')).toBe(true);
  });

  it('sets sessionStatus to idle', () => {
    const session = createDownloadSession('high');
    expect(session.sessionStatus).toBe('idle');
  });

  it('sets overallProgress to 0', () => {
    const session = createDownloadSession('high');
    expect(session.overallProgress).toBe(0);
  });

  it('sets downloadedBytes to 0', () => {
    const session = createDownloadSession('high');
    expect(session.downloadedBytes).toBe(0);
  });

  it('computes totalBytes as sum of all model sizes', () => {
    const session = createDownloadSession('high');
    const expectedTotal = session.models.reduce((sum, m) => sum + m.totalBytes, 0);
    expect(session.totalBytes).toBe(expectedTotal);
  });

  it('sets currentIndex to 0 (first model)', () => {
    const session = createDownloadSession('high');
    expect(session.currentIndex).toBe(0);
  });

  it('sets localUri to empty string for all models', () => {
    const session = createDownloadSession('high');
    expect(session.models.every((m) => m.localUri === '')).toBe(true);
  });

  it('sets a CDN URL for each model', () => {
    const session = createDownloadSession('high');
    expect(session.models.every((m) => m.currentUrl.length > 0)).toBe(true);
  });

  it('creates valid sessions for all tiers', () => {
    const tiers: DeviceTier[] = ['high', 'mid', 'low'];
    for (const tier of tiers) {
      const session = createDownloadSession(tier);
      expect(session.sessionStatus).toBe('idle');
      expect(session.models.length).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── getProgress ───────────────────────────────────────────────────

describe('getProgress', () => {
  function sessionWithProgress(overrides: Partial<DownloadSessionState> = {}): DownloadSessionState {
    const base = createDownloadSession('high');
    return { ...base, ...overrides };
  }

  it('returns 0 fileProgress and overallProgress for fresh session', () => {
    const session = createDownloadSession('high');
    const progress = getProgress(session);
    expect(progress.fileProgress).toBe(0);
    expect(progress.overallProgress).toBe(0);
  });

  it('returns correct fileProgress when downloadedBytes set', () => {
    const session = createDownloadSession('high');
    if (session.models[0]) {
      session.models[0].downloadedBytes = session.models[0].totalBytes / 2;
    }
    const progress = getProgress(session);
    expect(Math.round(progress.fileProgress * 10) / 10).toBe(0.5);
  });

  it('returns correct overallProgress when multiple models partially done', () => {
    const session = sessionWithProgress({
      overallProgress: 0.25,
      downloadedBytes: 500_000_000,
      totalBytes: 2_000_000_000,
    });
    const progress = getProgress(session);
    expect(progress.overallProgress).toBe(0.25);
  });

  it('fileProgress is 1 when downloadedBytes equals totalBytes', () => {
    const session = createDownloadSession('high');
    if (session.models[0]) {
      session.models[0].downloadedBytes = session.models[0].totalBytes;
    }
    const progress = getProgress(session);
    expect(progress.fileProgress).toBe(1);
  });

  it('returns correct overallBytes', () => {
    const session = sessionWithProgress({
      totalBytes: 1_000_000_000,
      downloadedBytes: 300_000_000,
    });
    const progress = getProgress(session);
    expect(progress.overallBytes.total).toBe(1_000_000_000);
    expect(progress.overallBytes.downloaded).toBe(300_000_000);
  });

  it('returns correct currentFileBytes', () => {
    const session = createDownloadSession('high');
    if (session.models[0]) {
      session.models[0].totalBytes = 1_000_000_000;
      session.models[0].downloadedBytes = 250_000_000;
    }
    const progress = getProgress(session);
    expect(progress.currentFileBytes.total).toBe(1_000_000_000);
    expect(progress.currentFileBytes.downloaded).toBe(250_000_000);
  });

  it('returns empty currentFileName when no models', () => {
    const session: DownloadSessionState = {
      models: [],
      currentIndex: 0,
      sessionStatus: 'idle',
      overallProgress: 0,
      totalBytes: 0,
      downloadedBytes: 0,
    };
    const progress = getProgress(session);
    expect(progress.currentFileName).toBe('');
  });
});

// ── formatModelName ───────────────────────────────────────────────

describe('formatModelName', () => {
  it('formats gemma-3 entry correctly', () => {
    const e = entry({ modelFamily: 'gemma-3', paramCount: 4, quant: 'q4_k_m' });
    expect(formatModelName(e)).toBe('Gemma 3 4B (q4_k_m)');
  });

  it('formats gemma-2 entry correctly', () => {
    const e = entry({ modelFamily: 'gemma-2', paramCount: 2, quant: 'q4_0' });
    expect(formatModelName(e)).toBe('Gemma 2 2B (q4_0)');
  });

  it('returns empty string for undefined entry', () => {
    expect(formatModelName(undefined)).toBe('');
  });

  it('includes param count and quant level', () => {
    const e = entry({ modelFamily: 'gemma-3', paramCount: 8, quant: 'fp16' });
    const name = formatModelName(e);
    expect(name).toContain('8B');
    expect(name).toContain('fp16');
  });
});

// ── formatBytes ───────────────────────────────────────────────────

describe('formatBytes', () => {
  it('formats bytes < 1024 as "N B"', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats KB range', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024 - 1)).toBe('1024.0 KB');
  });

  it('formats MB range', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('formats GB range', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB');
  });
});

// ── pickCdnUrl ────────────────────────────────────────────────────

describe('pickCdnUrl', () => {
  it('returns the first URL from the entry', () => {
    const e = entry({ cdnUrls: ['https://cdn1.example.com/model.gguf', 'https://cdn2.example.com/model.gguf'] });
    expect(pickCdnUrl(e)).toBe('https://cdn1.example.com/model.gguf');
  });

  it('returns empty string when no URLs', () => {
    const e = entry({ cdnUrls: [] });
    expect(pickCdnUrl(e)).toBe('');
  });
});

// ── Session persistence ───────────────────────────────────────────

describe('session persistence', () => {
  let testSession: DownloadSessionState;

  beforeEach(async () => {
    await clearSessionState();
    testSession = createDownloadSession('high');
    testSession.sessionStatus = 'running';
    testSession.overallProgress = 0.5;
  });

  afterEach(async () => {
    await clearSessionState();
  });

  it('saves and loads session state', async () => {
    await saveSessionState(testSession);
    const loaded = await loadSessionState();
    expect(loaded).not.toBeNull();
    expect(loaded!.sessionStatus).toBe('running');
    expect(loaded!.overallProgress).toBe(0.5);
    expect(loaded!.models.length).toBe(testSession.models.length);
  });

  it('returns null when no session saved', async () => {
    const loaded = await loadSessionState();
    expect(loaded).toBeNull();
  });

  it('clears saved session', async () => {
    await saveSessionState(testSession);
    await clearSessionState();
    const loaded = await loadSessionState();
    expect(loaded).toBeNull();
  });

  it('overwrites previous session on save', async () => {
    await saveSessionState(testSession);
    testSession.sessionStatus = 'paused';
    await saveSessionState(testSession);
    const loaded = await loadSessionState();
    expect(loaded!.sessionStatus).toBe('paused');
  });
});

// ── Edge cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('createDownloadSession with low tier returns only low-gated models', () => {
    const session = createDownloadSession('low');
    for (const model of session.models) {
      expect(model.entry.minDeviceTier).toBe('low');
    }
  });

  it('getProgress handles missing current model gracefully', () => {
    const session: DownloadSessionState = {
      models: [],
      currentIndex: 0,
      sessionStatus: 'idle',
      overallProgress: 0,
      totalBytes: 0,
      downloadedBytes: 0,
    };
    const progress = getProgress(session);
    expect(progress.fileProgress).toBe(0);
    expect(progress.overallProgress).toBe(0);
    expect(progress.currentFileBytes.downloaded).toBe(0);
    expect(progress.currentFileBytes.total).toBe(0);
  });

  it('getProgress handles currentIndex out of bounds', () => {
    const session = createDownloadSession('high');
    session.currentIndex = 999;
    const progress = getProgress(session);
    expect(progress.fileProgress).toBe(0);
    expect(progress.currentFileName).toBe('');
  });
});
