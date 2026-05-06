/**
 * Unit tests for the device-tier detection module.
 *
 * Tests cover:
 * - Pure classification logic (all tier branches)
 * - Thermal headroom downgrade
 * - RAM boundary values
 * - NPU gating
 * - Mock provider
 */
import {
  classifyDeviceTier,
  detectDeviceTier,
  MockCapabilityProvider,
  DeviceCapabilities,
  DeviceTier,
} from '../deviceTier';

// ── Helpers ────────────────────────────────────────────────────────

function caps(overrides: Partial<DeviceCapabilities> = {}): DeviceCapabilities {
  return {
    ramBytes: 8 * 1024 * 1024 * 1024, // 8 GB
    chipset: 'A17',
    hasModernNpu: true,
    thermalHeadroom: 'good',
    ...overrides,
  };
}

// ── classifyDeviceTier ─────────────────────────────────────────────

describe('classifyDeviceTier', () => {
  // High tier
  it('classifies 8GB + modern NPU + good thermal as high', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 8e9, hasModernNpu: true, thermalHeadroom: 'good' }));
    expect(result.tier).toBe('high');
  });

  it('classifies 6GB exactly + modern NPU + good thermal as high', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 6 * 1024 * 1024 * 1024,
      hasModernNpu: true,
      thermalHeadroom: 'good',
    }));
    expect(result.tier).toBe('high');
  });

  it('classifies 12GB + modern NPU + moderate thermal as high', () => {
    const result = classifyDeviceTier(caps({ ramBytes: 12e9, hasModernNpu: true, thermalHeadroom: 'moderate' }));
    expect(result.tier).toBe('high');
  });

  // Mid tier — 4–5 GB
  it('classifies 4GB as mid (below 6GB threshold)', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 4 * 1024 * 1024 * 1024,
      hasModernNpu: true,
    }));
    expect(result.tier).toBe('mid');
  });

  it('classifies 5GB + modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 5 * 1024 * 1024 * 1024,
      hasModernNpu: true,
    }));
    expect(result.tier).toBe('mid');
  });

  // Mid tier — ≥6GB but no modern NPU
  it('classifies 6GB without modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 6 * 1024 * 1024 * 1024,
      hasModernNpu: false,
    }));
    expect(result.tier).toBe('mid');
  });

  it('classifies 8GB without modern NPU as mid', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 8 * 1024 * 1024 * 1024,
      hasModernNpu: false,
    }));
    expect(result.tier).toBe('mid');
  });

  // Thermal downgrade
  it('downgrades high → mid when thermal headroom is poor', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 8 * 1024 * 1024 * 1024,
      hasModernNpu: true,
      thermalHeadroom: 'poor',
    }));
    expect(result.tier).toBe('mid');
  });

  it('downgrades high → mid with poor thermal even at 12GB', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 12 * 1024 * 1024 * 1024,
      hasModernNpu: true,
      thermalHeadroom: 'poor',
    }));
    expect(result.tier).toBe('mid');
  });

  it('does NOT downgrade mid → unsupported for poor thermal', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 4 * 1024 * 1024 * 1024,
      hasModernNpu: false,
      thermalHeadroom: 'poor',
    }));
    expect(result.tier).toBe('mid');
  });

  // Unsupported
  it('classifies 3GB as unsupported', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 3 * 1024 * 1024 * 1024,
    }));
    expect(result.tier).toBe('unsupported');
  });

  it('classifies 2GB as unsupported', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 2 * 1024 * 1024 * 1024,
    }));
    expect(result.tier).toBe('unsupported');
  });

  it('classifies 1GB as unsupported', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 1 * 1024 * 1024 * 1024,
    }));
    expect(result.tier).toBe('unsupported');
  });

  // Boundary: just above 4 GB (should be mid)
  it('classifies 4.01GB as mid (above 4GB floor)', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: Math.ceil(4.01 * 1024 * 1024 * 1024),
    }));
    expect(result.tier).toBe('mid');
  });

  // Boundary: just below 4 GB (should be unsupported)
  it('classifies 3.99GB as unsupported (below 4GB floor)', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: Math.floor(3.99 * 1024 * 1024 * 1024),
    }));
    expect(result.tier).toBe('unsupported');
  });

  // Returns metadata
  it('includes labelEn and labelZh in result', () => {
    const result = classifyDeviceTier(caps());
    expect(result.labelEn).toBe('High Performance');
    expect(result.labelZh).toBe('高性能');
  });

  it('includes capabilities in result', () => {
    const c = caps({ ramBytes: 6e9, chipset: 'A16', hasModernNpu: true, thermalHeadroom: 'good' });
    const result = classifyDeviceTier(c);
    expect(result.capabilities).toEqual(c);
  });

  // Mid tier labels
  it('returns mid labels for mid tier', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 4 * 1024 * 1024 * 1024,
    }));
    expect(result.labelEn).toBe('Standard');
    expect(result.labelZh).toBe('标准');
  });

  // Unsupported labels
  it('returns unsupported labels for unsupported tier', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 2 * 1024 * 1024 * 1024,
    }));
    expect(result.labelEn).toBe('Unsupported');
    expect(result.labelZh).toBe('不支持');
  });
});

// ── detectDeviceTier ───────────────────────────────────────────────

describe('detectDeviceTier', () => {
  it('uses the provided capability provider', async () => {
    const provider = new MockCapabilityProvider({
      ramBytes: 8 * 1024 * 1024 * 1024,
      chipset: 'A17',
      hasModernNpu: true,
      thermalHeadroom: 'good',
    });

    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('high');
  });

  it('detects mid tier via mock provider', async () => {
    const provider = MockCapabilityProvider.forTier('mid');
    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('mid');
  });

  it('detects unsupported tier via mock provider', async () => {
    const provider = MockCapabilityProvider.forTier('unsupported');
    const result = await detectDeviceTier(provider);
    expect(result.tier).toBe('unsupported');
  });
});

// ── MockCapabilityProvider ─────────────────────────────────────────

describe('MockCapabilityProvider', () => {
  it('returns the fixed capabilities', async () => {
    const provider = new MockCapabilityProvider({
      ramBytes: 6 * 1024 * 1024 * 1024,
      chipset: 'SD8Gen2',
      hasModernNpu: true,
      thermalHeadroom: 'moderate',
    });

    const caps = await provider.getCapabilities();
    expect(caps.ramBytes).toBe(6 * 1024 * 1024 * 1024);
    expect(caps.chipset).toBe('SD8Gen2');
    expect(caps.hasModernNpu).toBe(true);
    expect(caps.thermalHeadroom).toBe('moderate');
  });

  it('forTier creates correct high tier capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('high');
    const caps = await provider.getCapabilities();
    expect(caps.ramBytes).toBeGreaterThanOrEqual(6 * 1024 * 1024 * 1024);
    expect(caps.hasModernNpu).toBe(true);
    expect(caps.thermalHeadroom).toBe('good');
  });

  it('forTier creates correct mid tier capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('mid');
    const caps = await provider.getCapabilities();
    expect(caps.ramBytes).toBeGreaterThanOrEqual(4 * 1024 * 1024 * 1024);
    expect(caps.ramBytes).toBeLessThan(6 * 1024 * 1024 * 1024);
  });

  it('forTier creates correct unsupported capabilities', async () => {
    const provider = MockCapabilityProvider.forTier('unsupported');
    const caps = await provider.getCapabilities();
    expect(caps.ramBytes).toBeLessThan(4 * 1024 * 1024 * 1024);
  });

  it('returns a copy (not the original reference)', async () => {
    const original = {
      ramBytes: 4 * 1024 * 1024 * 1024,
      chipset: 'test',
      hasModernNpu: false,
      thermalHeadroom: 'moderate' as const,
    };
    const provider = new MockCapabilityProvider(original);
    const result = await provider.getCapabilities();
    expect(result).not.toBe(original);
  });
});

// ── Edge cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles exactly 4GB (boundary)', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 4 * 1024 * 1024 * 1024,
      hasModernNpu: false,
    }));
    expect(result.tier).toBe('mid');
  });

  it('handles exactly 6GB (boundary)', () => {
    const result = classifyDeviceTier(caps({
      ramBytes: 6 * 1024 * 1024 * 1024,
      hasModernNpu: true,
    }));
    expect(result.tier).toBe('high');
  });

  it('every tier has labels', () => {
    const c = caps();
    const result = classifyDeviceTier(c);
    expect(result.labelEn).toBeTruthy();
    expect(result.labelZh).toBeTruthy();
  });
});
