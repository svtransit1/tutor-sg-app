import { assignTier, buildCapabilities } from '../src';
import {
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
  NativeDeviceInfo,
} from '../src/types';

function mockDevice(ramGB: number, chipset: string, npuAvailable: boolean): NativeDeviceInfo {
  return { totalRAM: ramGB, chipset, npuAvailable };
}

describe('assignTier', () => {
  it('returns belowFloor for devices under 3 GB RAM', () => {
    const result = assignTier(mockDevice(2, 'SDM450', false));
    expect(result).toEqual({ tier: 'low', belowFloor: true });
  });

  it('returns high tier for ≥6 GB RAM + modern NPU', () => {
    const result = assignTier(mockDevice(8, 'A17', true));
    expect(result).toEqual({ tier: 'high', belowFloor: false });
  });

  it('returns mid tier for 4 GB RAM without modern NPU', () => {
    const result = assignTier(mockDevice(4, 'SDM710', false));
    expect(result).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns mid tier for ≥6 GB RAM without NPU', () => {
    const result = assignTier(mockDevice(8, 'Unknown Chipset', false));
    expect(result).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns mid tier for 4 GB RAM with modern NPU', () => {
    const result = assignTier(mockDevice(4, 'A15', true));
    expect(result).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns high tier for SDM8 Gen2 + sufficient RAM', () => {
    const result = assignTier(mockDevice(8, 'SDM8 Gen2', true));
    expect(result).toEqual({ tier: 'high', belowFloor: false });
  });

  it('returns high tier for Tensor G3 + sufficient RAM', () => {
    const result = assignTier(mockDevice(12, 'Tensor G3', true));
    expect(result).toEqual({ tier: 'high', belowFloor: false });
  });

  it('returns belowFloor for 0 GB RAM (simulator edge case)', () => {
    const result = assignTier(mockDevice(0, '', false));
    expect(result.belowFloor).toBe(true);
  });

  it('returns mid tier for exactly 3 GB RAM at floor boundary', () => {
    const result = assignTier(mockDevice(3, 'SDM450', false));
    expect(result).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns mid tier for 5 GB RAM without modern NPU', () => {
    const result = assignTier(mockDevice(5, 'SDM778G', false));
    expect(result).toEqual({ tier: 'mid', belowFloor: false });
  });
});

describe('buildCapabilities', () => {
  it('builds capabilities with auto-detected tier', () => {
    const caps = buildCapabilities(mockDevice(8, 'A18', true));
    expect(caps.tier).toBe('high');
    expect(caps.ramGB).toBe(8);
    expect(caps.chipset).toBe('A18');
    expect(caps.npuAvailable).toBe(true);
    expect(caps.belowFloor).toBe(false);
  });

  it('builds capabilities with below-floor flag', () => {
    const caps = buildCapabilities(mockDevice(2, 'old', false));
    expect(caps.belowFloor).toBe(true);
    expect(caps.tier).toBe('low');
  });

  it('respects manual tier override', () => {
    const caps = buildCapabilities(mockDevice(4, 'SDM710', false), 'high');
    expect(caps.tier).toBe('high');
    expect(caps.belowFloor).toBe(false);
  });
});

describe('constants', () => {
  it('has correct RAM thresholds', () => {
    expect(TIER_THRESHOLDS.HIGH_RAM_GB).toBe(6);
    expect(TIER_THRESHOLDS.MID_RAM_GB).toBe(4);
    expect(TIER_THRESHOLDS.FLOOR_RAM_GB).toBe(3);
  });

  it('includes expected high-tier chipsets', () => {
    const chipsets = Array.from(HIGH_TIER_CHIPSETS);
    expect(chipsets).toContain('A14');
    expect(chipsets).toContain('SDM8 Gen1');
    expect(chipsets).toContain('Tensor G2');
    expect(chipsets.length).toBeGreaterThan(5);
  });
});
