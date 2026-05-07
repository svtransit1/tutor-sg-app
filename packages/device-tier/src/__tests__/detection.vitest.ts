import { describe, it, expect } from 'vitest';
vi.mock('react-native', () => ({ Platform: { OS: 'ios' }, NativeModules: {}, Modal: 'Modal', View: 'View', Text: 'Text', StyleSheet: { create: (s:unknown) => s }, SafeAreaView: 'SafeAreaView' }));
import { assignTier, buildCapabilities, TIER_THRESHOLDS, HIGH_TIER_CHIPSETS, MODEL_MAP, BELOW_FLOOR_MESSAGES, SETTINGS_KEY } from '../index';
describe('assignTier', () => {
  it('below floor', () => { const r = assignTier({ totalRAM: 2, chipset: 'A14', npuAvailable: true }); expect(r.tier).toBe('low'); expect(r.belowFloor).toBe(true); });
  it('high tier', () => { const r = assignTier({ totalRAM: 8, chipset: 'A17', npuAvailable: true }); expect(r.tier).toBe('high'); expect(r.belowFloor).toBe(false); });
  it('mid tier', () => { const r = assignTier({ totalRAM: 4, chipset: 'A13', npuAvailable: false }); expect(r.tier).toBe('mid'); expect(r.belowFloor).toBe(false); });
  it('high ram no npu mid', () => { const r = assignTier({ totalRAM: TIER_THRESHOLDS.HIGH_RAM_GB, chipset: 'unknown', npuAvailable: false }); expect(r.tier).toBe('mid'); });
});
describe('buildCapabilities', () => {
  it('auto', () => { const c = buildCapabilities({ totalRAM: 8, chipset: 'A17', npuAvailable: true }); expect(c.tier).toBe('high'); });
  it('override', () => { const c = buildCapabilities({ totalRAM: 8, chipset: 'A17', npuAvailable: true }, 'mid'); expect(c.tier).toBe('mid'); });
});
describe('constants', () => {
  it('chipsets', () => { expect(HIGH_TIER_CHIPSETS).toContain('A14'); });
  it('bilingual', () => { expect(BELOW_FLOOR_MESSAGES).toHaveProperty('en'); expect(BELOW_FLOOR_MESSAGES).toHaveProperty('zh'); });
  it('key', () => { expect(SETTINGS_KEY).toBe('device_tier'); });
  it('map', () => { expect(MODEL_MAP).toHaveProperty('high'); });
});
