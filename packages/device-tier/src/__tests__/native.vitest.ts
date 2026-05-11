import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('react-native', () => {
  const NM: Record<
    string,
    { getDeviceInfo?: () => Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }> }
  > = {};
  return { Platform: { OS: 'ios' }, NativeModules: NM };
});
let NM: Record<
  string,
  { getDeviceInfo?: () => Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }> }
>;
beforeEach(async () => {
  vi.resetModules();
  NM = (await import('react-native')).NativeModules as typeof NM;
  delete NM.TutorSgDeviceInfo;
});
describe('getDeviceInfo', () => {
  it('fallback when native module absent', async () => {
    const { getDeviceInfo } = await import('../native');
    const info = await getDeviceInfo();
    expect(info.totalRAM).toBeGreaterThan(0);
  });
  it('calls native module', async () => {
    NM.TutorSgDeviceInfo = {
      getDeviceInfo: vi
        .fn()
        .mockResolvedValue({ totalRAM: 12, chipset: 'A18', npuAvailable: true }),
    };
    const { getDeviceInfo } = await import('../native');
    expect(await getDeviceInfo()).toEqual({ totalRAM: 12, chipset: 'A18', npuAvailable: true });
  });
  it('fallback on error', async () => {
    NM.TutorSgDeviceInfo = { getDeviceInfo: vi.fn().mockRejectedValue(new Error('err')) };
    const { getDeviceInfo } = await import('../native');
    const info = await getDeviceInfo();
    expect(info.totalRAM).toBeGreaterThan(0);
  });
  it('fallback on missing method', async () => {
    NM.TutorSgDeviceInfo = {};
    const { getDeviceInfo } = await import('../native');
    const info = await getDeviceInfo();
    expect(info.totalRAM).toBeGreaterThan(0);
  });
});
