import * as SQLite from 'expo-sqlite';
import { ensureSettingsTable, saveDeviceTier, loadDeviceTier } from '../persistence';
import { __getMockDb, __resetMockDb } from '../../__mocks__/expo-sqlite';

describe('persistence', () => {
  beforeEach(() => __resetMockDb());

  describe('ensureSettingsTable', () => {
    it('creates settings table if not exists', async () => {
      await ensureSettingsTable(__getMockDb() as unknown as SQLite.SQLiteDatabase);
      expect(__getMockDb().execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS settings'),
      );
    });
  });

  describe('saveDeviceTier', () => {
    it('upserts the tier value', async () => {
      await saveDeviceTier(__getMockDb() as unknown as SQLite.SQLiteDatabase, 'high');
      expect(__getMockDb().runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE'),
        'device_tier',
        'high',
      );
    });
  });

  describe('loadDeviceTier', () => {
    it('returns null when no row exists', async () => {
      expect(await loadDeviceTier(__getMockDb() as unknown as SQLite.SQLiteDatabase)).toBeNull();
    });

    it('returns the stored tier', async () => {
      __getMockDb().getFirstAsync.mockResolvedValue({ value: 'mid' });
      expect(await loadDeviceTier(__getMockDb() as unknown as SQLite.SQLiteDatabase)).toBe('mid');
    });
  });
});
