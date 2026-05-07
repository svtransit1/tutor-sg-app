import * as SQLite from 'expo-sqlite';
import { DeviceTier, SETTINGS_KEY } from './types';

const DB_NAME = 'tutor-sg.db';

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(DB_NAME);
}

export async function ensureSettingsTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
  );
}

export async function saveDeviceTier(db: SQLite.SQLiteDatabase, tier: DeviceTier): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
    SETTINGS_KEY,
    tier,
  );
}

export async function loadDeviceTier(db: SQLite.SQLiteDatabase): Promise<DeviceTier | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?;`,
    SETTINGS_KEY,
  );
  return (row?.value as DeviceTier) ?? null;
}
