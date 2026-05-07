jest.mock('@tutor-sg/device-tier-native', () => {
  let mockMemory = 8;
  let mockChipset = 'A18';
  let mockNPU = true;
  return {
    __setMockMemory: (gb: number) => { mockMemory = gb; },
    __setMockChipset: (cs: string) => { mockChipset = cs; },
    __setMockNPU: (av: boolean) => { mockNPU = av; },
    getTotalMemory: jest.fn(() => Promise.resolve(mockMemory)),
    getChipset: jest.fn(() => Promise.resolve(mockChipset)),
    isNPUAvailable: jest.fn(() => Promise.resolve(mockNPU)),
  };
}, { virtual: true });

jest.mock('@tutor-sg/device-tier', () => ({
  assignTier: jest.fn((info: any) => {
    if (info.totalRAM < 3) return { tier: 'low', belowFloor: true };
    if (info.totalRAM >= 6 && info.npuAvailable) return { tier: 'high', belowFloor: false };
    return { tier: 'mid', belowFloor: false };
  }),
  buildCapabilities: jest.fn((info: any, tier?: string) => {
    const t = info.totalRAM < 3
      ? { tier: 'low', belowFloor: true }
      : info.totalRAM >= 6 && info.npuAvailable
        ? { tier: 'high', belowFloor: false }
        : { tier: 'mid', belowFloor: false };
    return {
      tier: tier ?? t.tier,
      ramGB: info.totalRAM,
      chipset: info.chipset,
      npuAvailable: info.npuAvailable,
      belowFloor: t.belowFloor,
    };
  }),
  openDatabase: jest.fn(() => Promise.resolve({} as any)),
  ensureSettingsTable: jest.fn(() => Promise.resolve()),
  saveDeviceTier: jest.fn() as jest.Mock<Promise<void>, [any, string]>,
  loadDeviceTier: jest.fn(() => Promise.resolve(null)),
}), { virtual: true });

import { detectDeviceTier } from '../deviceTierDetector';

const native = jest.requireMock('@tutor-sg/device-tier-native') as any;
const deviceTier = jest.requireMock('@tutor-sg/device-tier') as any;

describe('detectDeviceTier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    native.__setMockMemory(8);
    native.__setMockChipset('A18');
    native.__setMockNPU(true);
  });

  it('returns high tier for 8GB + A18 + NPU', async () => {
    const result = await detectDeviceTier();
    expect(result.tier).toBe('high');
    expect(result.belowFloor).toBe(false);
    expect(result.ramGB).toBe(8);
    expect(result.chipset).toBe('A18');
    expect(result.npuAvailable).toBe(true);
  });

  it('returns mid tier for 4GB + old chipset', async () => {
    native.__setMockMemory(4);
    native.__setMockChipset('A13');
    native.__setMockNPU(false);
    const result = await detectDeviceTier();
    expect(result.tier).toBe('mid');
    expect(result.belowFloor).toBe(false);
  });

  it('returns below-floor for 2GB RAM', async () => {
    native.__setMockMemory(2);
    native.__setMockChipset('A9');
    native.__setMockNPU(false);
    const result = await detectDeviceTier();
    expect(result.tier).toBe('low');
    expect(result.belowFloor).toBe(true);
  });

  it('calls native module functions', async () => {
    await detectDeviceTier();
    expect(native.getTotalMemory).toHaveBeenCalledTimes(1);
    expect(native.getChipset).toHaveBeenCalledTimes(1);
    expect(native.isNPUAvailable).toHaveBeenCalledTimes(1);
  });

  it('persists the detected tier', async () => {
    await detectDeviceTier();
    expect(deviceTier.saveDeviceTier).toHaveBeenCalledWith(expect.any(Object), 'high');
  });
});
