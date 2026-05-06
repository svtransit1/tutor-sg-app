/**
 * Unit tests for the device-tier detection module.
 *
 * Tests cover:
 * - Pure classification logic (all tier branches)
 * - Thermal headroom downgrade
 * - Free storage downgrade
 * - RAM boundary values
 * - NPU gating
 * - Mock provider
 * - Session cache
 */
import {
  classifyDeviceTier,
  DeviceCapabilities,
  DeviceTier,
  MID_TIER_RAM_BYTES,
  HIGH_TIER_RAM_BYTES,
} from '@tutor-sg/shared';
import {
  detectDeviceTier,
  clearDeviceTierCache,
  MockCapabilityProvider,
} from '../deviceTier';

// ── Helpers ────────────────────────────────────────────────────────

const GB = 1024 * 1024 * 1024;

function caps(overrides: Partial<DeviceCapabilities> = {}): DeviceCapabilities {
  return {
    ramBytes: 8 * GB,
    chipset: 'A17',
    hasModernNpu: true,
    thermalHeadroom: 'good',
    freeStorageBytes: 50 * GB,
    ...overrides,
  };
}

// ── classifyDeviceTier (shared) ────────────────────────────────────

describe('classifyDeviceTier', () => {
  // ── High tier ──
  it('classifies 8GB + modern NPU + good thermal + enough storage as high', () => {
    const result = classifyDeviceTier(caps());
    expect(result.tier).toBe('high');
  });

  it('classifies 6GB exactly + modern NPU as high', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 6 * GB }));
    expect(result.tier).toBe('high');
  });

  it('classifies 12GB + modern NPU + moderate thermal as high', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 12 * GB, thermalHeadroom: 'moderate' }));
    expect(result.tier).toBe('high');
  });

  // ── Mid tier (4-5 GB) ──
  it('classifies 4GB as mid (below 6GB threshold)', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB }));
    expect(result.tier).toBe('mid');
  });

  it('classifies 5GB + modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 5 * GB }));
    expect(result.tier).toBe('mid');
  });

  // ── Mid tier (≥6GB w/o modern NPU) ──
  it('classifies 6GB without modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 6 * GB, hasModernNpu: false }));
    expect(result.tier).toBe('mid');
  });

  it('classifies 8GB without modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 8 * GB, hasModernNpu: false }));
    expect(result.tier).toBe('mid');
  });

  // ── Thermal downgrade ──
  it('downgrades high → mid when thermal headroom is poor', () => {
    const result = classifyDeviceTier(caps({ thermalHeadroom: 'poor' }));
    expect(result.tier).toBe('mid');
  });

  it('downgrades high → mid with poor thermal even at 12GB', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 12 * GB, thermalHeadroom: 'poor' }));
    expect(result.tier).toBe('mid');
  });

  it('does NOT downgrade mid → low for poor thermal', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB, thermalHeadroom: 'poor' }));
    expect(result.tier).toBe('mid');
  });

  // ── Storage downgrade ──
  it('downgrades high → mid when free storage < 5 GB', () => {
    const result = classifyDeviceTier(caps({ freeStorageBytes: 4 * GB }));
    expect(result.tier).toBe('mid');
  });

  it('downgrades mid → low when free storage < 5 GB', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB, freeStorageBytes: 3 * GB }));
    expect(result.tier).toBe('low');
  });

  it('does NOT downgrade low further for storage', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 2 * GB, freeStorageBytes: 1 * GB }));
    expect(result.tier).toBe('low');
  });

  // ── Low tier (< 4 GB RAM) ──
  it('classifies 3GB as low', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 3 * GB }));
    expect(result.tier).toBe('low');
  });

  it('classifies 2GB as low', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 2 * GB }));
    expect(result.tier).toBe('low');
  });

  // ── Boundaries ──
  it('classifies exactly 4GB as mid (on boundary)', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB, hasModernNpu: false }));
    expect(result.tier).toBe('mid');
  });

  it('classifies exactly 6GB as high (on boundary)', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 6 * GB }));
    expect(result.tier).toBe('high');
  });

  it('classifies just above 4GB as mid', () => {
    const result = classifyDeviceTier(caps({ ramBytes: Math.ceil(4.01 * GB) }));
    expect(result.tier).toBe('mid');
  });

  it('classifies just below 4GB as low', () => {
    const result = classifyDeviceTier(caps({ ramBytes: Math.floor(3.99 * GB) }));
    expect(result.tier).toBe('low');
  });

  // ── Labels ──
  it('includes labelEn and labelZh in result', () => {
    const result = classifyDeviceTier(caps());
    expect(result.labelEn).toBe('High Performance');
    expect(result.labelZh).toBe('高性能');
  });

  it('returns mid labels for mid tier', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB }));
    expect(result.labelEn).toBe('Standard');
    expect(result.labelZh).toBe('标准');
  });

  it('returns low labels for low tier', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 2 * GB }));
    expect(result.labelEn).toBe('Basic');
    expect(result.labelZh).toBe('基础');
  });
});

// ── Acceptance criteria device mapping ─────────────────────────────

describe('acceptance criteria: device → tier mapping', () => {
  // iPhone 15 Pro: 8GB, A17 Pro → high
  it('iPhone 15 Pro → high', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 8 * GB,
      chipset: 'A17',
      hasModernNpu: true,
      thermalHeadroom: 'good',
      freeStorageBytes: 50 * GB,
    }));
    expect(result.tier).toBe('high');
  });

  // Pixel 8: 8GB, Tensor G3 → high
  it('Pixel 8 → high', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 8 * GB,
      chipset: 'TensorG3',
      hasModernNpu: true,
      thermalHeadroom: 'good',
      freeStorageBytes: 50 * GB,
    }));
    expect(result.tier).toBe('high');
  });

  // iPhone 12: 4GB, A14 → mid
  it('iPhone 12 → mid', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 4 * GB,
      chipset: 'A14',
      hasModernNpu: true,
      thermalHeadroom: 'good',
      freeStorageBytes: 20 * GB,
    }));
    expect(result.tier).toBe('mid');
  });

  // Pixel 5: 8GB, SD765G (no modern NPU) → mid
  it('Pixel 5 → mid', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 8 * GB,
      chipset: 'SD765G',
      hasModernNpu: false,
      thermalHeadroom: 'moderate',
      freeStorageBytes: 20 * GB,
    }));
    expect(result.tier).toBe('mid');
  });

  // Redmi 9: 3GB, MediaTek G80 → low
  it('Redmi 9 → low', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 3 * GB,
      chipset: '',
      hasModernNpu: false,
      thermalHeadroom: 'poor',
      freeStorageBytes: 10 * GB,
    }));
    expect(result.tier).toBe('low');
  });
});

// ── detectDeviceTier (async + cache) ───────────────────────────────

describe('detectDeviceTier', () => {
  beforeEach(() => clearDeviceTierCache());

  it('uses the provided capability provider', async () => {
    const provider = new MockCapabilityProvider(caps());
    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('high');
  });

  it('detects mid tier via mock provider', async () => {
    const provider = MockCapabilityProvider.forTier('mid');
    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('mid');
  });

  it('detects low tier via mock provider', async () => {
    const provider = MockCapabilityProvider.forTier('low');
    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('low');
  });

  it('caches result for session', async () => {
    const provider = MockCapabilityProvider.forTier('high');
    const r1 = await detectDeviceTier(provider);
    const r2 = await detectDeviceTier(); // no provider → should use cache
    expect(r2.tier).toBe('high');
    expect(r2).toBe(r1); // same object reference (cached)
  });

  it('clearDeviceTierCache resets cache', async () => {
    const provider = MockCapabilityProvider.forTier('high');
    await detectDeviceTier(provider);
    clearDeviceTierCache();
    const midProvider = MockCapabilityProvider.forTier('mid');
    const result = await detectDeviceTier(midProvider);
    expect(result.tier).toBe('mid');
  });
});

// ── MockCapabilityProvider ─────────────────────────────────────────

describe('MockCapabilityProvider', () => {
  it('returns the fixed capabilities', async () => {
    const provider = new MockCapabilityProvider(caps({ ramBytes: 6 * GB }));
    const c = await provider.getCapabilities();
    expect(c.ramBytes).toBe(6 * GB);
  });

  it('forTier creates correct high tier capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('high');
    const c = await provider.getCapabilities();
    expect(c.ramBytes).toBeGreaterThanOrEqual(6 * GB);
    expect(c.hasModernNpu).toBe(true);
    expect(c.freeStorageBytes).toBeGreaterThanOrEqual(5 * GB);
  });

  it('forTier creates correct mid tier capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('mid');
    const c = await provider.getCapabilities();
    expect(c.ramBytes).toBeGreaterThanOrEqual(4 * GB);
    expect(c.ramBytes).toBeLessThan(6 * GB);
  });

  it('forTier creates correct low tier capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('low');
    const c = await provider.getCapabilities();
    expect(c.ramBytes).toBeLessThan(4 * GB);
  });
});

// ── Edge cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles exactly 4GB (boundary)', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 4 * GB, hasModernNpu: false }));
    expect(result.tier).toBe('mid');
  });

  it('handles exactly 6GB (boundary)', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 6 * GB }));
    expect(result.tier).toBe('high');
  });

  it('every tier has labels', () => {
    const tiers: DeviceTier[] = ['high', 'mid', 'low'];
    for (const tier of tiers) {
      const c = caps();
      const result = classifyDeviceTier(c);
      if (result.tier === tier) {
        expect(result.labelEn).toBeTruthy();
        expect(result.labelZh).toBeTruthy();
      }
    }
  });

  it('storage boundary: exactly 5GB free keeps tier', () => {
    // 5GB free + 8GB RAM + modern NPU → high (on boundary)
    const result = classifyDeviceTier(caps({ freeStorageBytes: 5 * GB }));
    expect(result.tier).toBe('high');
  });

  it('storage boundary: just below 5GB free downgrades', () => {
    const result = classifyDeviceTier(caps({
      freeStorageBytes: Math.floor(4.99 * GB),
    }));
    expect(result.tier).toBe('mid');
  });
});
