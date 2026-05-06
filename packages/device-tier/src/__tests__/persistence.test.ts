import { ensureSettingsTable, saveDeviceTier, loadDeviceTier } from '../persistence';
import { __getMockDb, __resetMockDb } from '../../__mocks__/expo-sqlite';

describe('persistence', () => {
  const db = __getMockDb();

  beforeEach(() => {
    __resetMockDb();
  });

  describe('ensureSettingsTable', () => {
    it('creates settings table if not exists', async () => {
      await ensureSettingsTable(db);
      expect(db.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS settings'),
      );
    });
  });

  describe('saveDeviceTier', () => {
    it('upserts the tier value', async () => {
      await saveDeviceTier(db, 'high');
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE'),
        'device_tier',
        'high',
      );
    });
  });

  describe('loadDeviceTier', () => {
    it('returns null when no row exists', async () => {
      const result = await loadDeviceTier(db);
      expect(result).toBeNull();
    });

    it('returns the stored tier', async () => {
      db.getFirstAsync.mockResolvedValue({ value: 'mid' });
      const result = await loadDeviceTier(db);
      expect(result).toBe('mid');
    });
  });
});
