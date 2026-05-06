import { ensureSettingsTable, saveDeviceTier, loadDeviceTier } from '../persistence';
import { __getMockDb, __resetMockDb } from '../../__mocks__/expo-sqlite';

describe('persistence', () => {
  beforeEach(() => __resetMockDb());

  it('creates settings table', async () => {
    await ensureSettingsTable(__getMockDb() as any);
    expect(__getMockDb().execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE'));
  });

  it('upserts tier value', async () => {
    await saveDeviceTier(__getMockDb() as any, 'high');
    expect(__getMockDb().runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE'), 'device_tier', 'high');
  });

  it('returns null when no data', async () => {
    expect(await loadDeviceTier(__getMockDb() as any)).toBeNull();
  });

  it('returns stored tier', async () => {
    __getMockDb().getFirstAsync.mockResolvedValue({ value: 'mid' });
    expect(await loadDeviceTier(__getMockDb() as any)).toBe('mid');
  });
});
