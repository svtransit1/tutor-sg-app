import {
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
  MODEL_MAP,
  SETTINGS_KEY,
  BELOW_FLOOR_MESSAGES,
  assignTier,
  buildCapabilities,
  type DeviceTier,
  type DeviceCapabilities,
  type NativeDeviceInfo,
  type DeviceTierNativeModule,
} from '../index';

describe('@tutor-sg/device-tier — smoke test', () => {
  // --- Constants ---
  it('exports TIER_THRESHOLDS', () => {
    expect(TIER_THRESHOLDS.HIGH_RAM_GB).toBe(6);
    expect(TIER_THRESHOLDS.MID_RAM_GB).toBe(4);
    expect(TIER_THRESHOLDS.FLOOR_RAM_GB).toBe(3);
  });

  it('exports HIGH_TIER_CHIPSETS', () => {
    expect(HIGH_TIER_CHIPSETS).toContain('A14');
    expect(HIGH_TIER_CHIPSETS.length).toBeGreaterThan(0);
  });

  it('exports MODEL_MAP for all tiers', () => {
    expect(MODEL_MAP.high).toBeDefined();
    expect(MODEL_MAP.mid).toBeDefined();
    expect(MODEL_MAP.low).toBeDefined();
    expect(MODEL_MAP.low.llm).toBe('none');
  });

  it('exports SETTINGS_KEY', () => {
    expect(SETTINGS_KEY).toBe('device_tier');
  });

  it('exports BELOW_FLOOR_MESSAGES (bilingual)', () => {
    expect(BELOW_FLOOR_MESSAGES.en).toBeTruthy();
    expect(BELOW_FLOOR_MESSAGES.zh).toBeTruthy();
  });

  // --- Types ---
  it('DeviceCapabilities type is structurally valid', () => {
    const cap: DeviceCapabilities = {
      tier: 'high', ramGB: 8, chipset: 'A17',
      npuAvailable: true, belowFloor: false,
    };
    expect(cap.tier).toBe('high');
  });

  it('NativeDeviceInfo type is structurally valid', () => {
    const info: NativeDeviceInfo = {
      totalRAM: 8192, chipset: 'SDM8 Gen3', npuAvailable: true,
    };
    expect(info.totalRAM).toBe(8192);
  });

  it('DeviceTierNativeModule interface is valid', () => {
    const mod: DeviceTierNativeModule = {
      getTotalMemory: async () => 4096,
      getChipset: async () => 'A15',
      isNPUAvailable: async () => true,
    };
    expect(mod.getTotalMemory).toBeDefined();
  });

  // --- Runtime: assignTier ---
  it('assignTier: high tier (8GB + modern NPU)', () => {
    const result = assignTier({ totalRAM: 8, chipset: 'A16', npuAvailable: true });
    expect(result.tier).toBe('high');
    expect(result.belowFloor).toBe(false);
  });

  it('assignTier: mid tier (4GB, NPU or not)', () => {
    const result = assignTier({ totalRAM: 4, chipset: 'old-chip', npuAvailable: false });
    expect(result.tier).toBe('mid');
    expect(result.belowFloor).toBe(false);
  });

  it('assignTier: high RAM but no NPU → mid', () => {
    const result = assignTier({ totalRAM: 8, chipset: 'unknown', npuAvailable: false });
    expect(result.tier).toBe('mid');
    expect(result.belowFloor).toBe(false);
  });

  it('assignTier: high RAM but old NPU chipset → mid', () => {
    const result = assignTier({ totalRAM: 8, chipset: 'A13', npuAvailable: true });
    expect(result.tier).toBe('mid');
    expect(result.belowFloor).toBe(false);
  });

  it('assignTier: below floor (< 3 GB)', () => {
    const result = assignTier({ totalRAM: 2, chipset: 'anything', npuAvailable: false });
    expect(result.tier).toBe('low');
    expect(result.belowFloor).toBe(true);
  });

  // --- Runtime: buildCapabilities ---
  it('buildCapabilities: constructs from NativeDeviceInfo', () => {
    const info: NativeDeviceInfo = { totalRAM: 6, chipset: 'A15', npuAvailable: true };
    const cap = buildCapabilities(info);
    expect(cap.tier).toBe('high');
    expect(cap.ramGB).toBe(6);
    expect(cap.chipset).toBe('A15');
    expect(cap.npuAvailable).toBe(true);
    expect(cap.belowFloor).toBe(false);
  });

  it('buildCapabilities: override tier', () => {
    const info: NativeDeviceInfo = { totalRAM: 8, chipset: 'A16', npuAvailable: true };
    const cap = buildCapabilities(info, 'mid');
    expect(cap.tier).toBe('mid');
    expect(cap.ramGB).toBe(8);
  });
});
