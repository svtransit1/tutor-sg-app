import { assignTier, buildCapabilities } from '../index';
import { TIER_THRESHOLDS, HIGH_TIER_CHIPSETS, MODEL_MAP, type NativeDeviceInfo } from '../types';

function mockDevice(ramGB: number, chipset: string, npuAvailable: boolean): NativeDeviceInfo {
  return { totalRAM: ramGB, chipset, npuAvailable };
}

describe('assignTier', () => {
  it('returns belowFloor for devices under 3 GB RAM', () => {
    expect(assignTier(mockDevice(2, 'SDM450', false))).toEqual({ tier: 'low', belowFloor: true });
  });

  it('returns high tier for >=6 GB RAM + modern NPU', () => {
    expect(assignTier(mockDevice(8, 'A17', true))).toEqual({ tier: 'high', belowFloor: false });
  });

  it('returns mid tier for 4 GB RAM without modern NPU', () => {
    expect(assignTier(mockDevice(4, 'SDM710', false))).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns mid tier for >=6 GB RAM without NPU', () => {
    expect(assignTier(mockDevice(8, 'Unknown', false))).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns mid tier for 4 GB RAM with modern NPU', () => {
    expect(assignTier(mockDevice(4, 'A15', true))).toEqual({ tier: 'mid', belowFloor: false });
  });

  it('returns high tier for SDM8 Gen2 + sufficient RAM', () => {
    expect(assignTier(mockDevice(8, 'SDM8 Gen2', true))).toEqual({ tier: 'high', belowFloor: false });
  });

  it('returns belowFloor for 0 GB RAM', () => {
    expect(assignTier(mockDevice(0, '', false)).belowFloor).toBe(true);
  });

  it('returns mid tier for exactly 3 GB RAM at floor boundary', () => {
    expect(assignTier(mockDevice(3, 'SDM450', false))).toEqual({ tier: 'mid', belowFloor: false });
  });
});

describe('buildCapabilities', () => {
  it('builds capabilities with auto-detected tier', () => {
    const caps = buildCapabilities(mockDevice(8, 'A18', true));
    expect(caps.tier).toBe('high');
    expect(caps.belowFloor).toBe(false);
  });

  it('respects manual tier override', () => {
    const caps = buildCapabilities(mockDevice(4, 'SDM710', false), 'high');
    expect(caps.tier).toBe('high');
  });
});

describe('constants', () => {
  it('has correct RAM thresholds', () => {
    expect(TIER_THRESHOLDS.HIGH_RAM_GB).toBe(6);
    expect(TIER_THRESHOLDS.MID_RAM_GB).toBe(4);
    expect(TIER_THRESHOLDS.FLOOR_RAM_GB).toBe(3);
  });

  it('includes expected high-tier chipsets', () => {
    expect(HIGH_TIER_CHIPSETS).toContain('A14');
    expect(HIGH_TIER_CHIPSETS).toContain('Tensor G2');
  });

  it('maps high tier to 4B models', () => {
    expect(MODEL_MAP.high.llm).toBe('Gemma-2 4B');
  });

  it('maps low tier to no models', () => {
    expect(MODEL_MAP.low.llm).toBe('none');
  });
});
