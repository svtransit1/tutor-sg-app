import { openDatabaseAsync } from 'expo-sqlite';
import type { DeviceCapabilities, DeviceTierPersistence } from '@tutor-sg/device-tier';

const DB_NAME = 'tutor-sg.db';
const TABLE = 'device_tier_cache';
const KEY = 'device_tier';

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      );
      return db;
    });
  }
  return dbPromise;
}

export const deviceTierCache: DeviceTierPersistence = {
  async get(): Promise<DeviceCapabilities | null> {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM ${TABLE} WHERE key = ?`, KEY,
      );
      if (!row) return null;
      return JSON.parse(row.value) as DeviceCapabilities;
    } catch { return null; }
  },

  async set(caps: DeviceCapabilities): Promise<void> {
    try {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TABLE} (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
        KEY, JSON.stringify(caps),
      );
    } catch { /* best-effort */ }
  },
};
