import { openDatabaseAsync } from 'expo-sqlite';

export type KidLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

export interface KidProfile {
  id: string;
  name: string;
  level: KidLevel;
  avatarKey: string;
  createdAt: string;
  isActive: boolean;
}

interface KidProfileRow {
  id: string;
  name: string;
  level: string;
  avatar_key: string;
  created_at: string;
  is_active: number;
}

const DB_NAME = 'tutor-sg.db';
let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

async function getDb() {
  if (!dbPromise) {
    const db = await openDatabaseAsync(DB_NAME);
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS kid_profiles (id TEXT PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL CHECK(level IN ('P1','P2','P3','P4','P5','P6')), avatar_key TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), is_active INTEGER NOT NULL DEFAULT 0);",
    );
    dbPromise = Promise.resolve(db);
  }
  return dbPromise;
}

function rowToProfile(row: KidProfileRow): KidProfile {
  return {
    id: row.id,
    name: row.name,
    level: row.level as KidLevel,
    avatarKey: row.avatar_key,
    createdAt: row.created_at,
    isActive: row.is_active === 1,
  };
}

export class KidProfileRepository {
  static async createProfile(name: string, level: KidLevel, avatarKey: string): Promise<string> {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.runAsync(
      'INSERT INTO kid_profiles (id, name, level, avatar_key, created_at, is_active) VALUES (?, ?, ?, ?, ?, 0)',
      id,
      name,
      level,
      avatarKey,
      new Date().toISOString(),
    );
    return id;
  }
  static async getProfiles(): Promise<KidProfile[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<KidProfileRow>(
      'SELECT * FROM kid_profiles ORDER BY created_at ASC',
    );
    return rows.map(rowToProfile);
  }
  static async updateProfile(
    id: string,
    fields: Partial<Pick<KidProfile, 'name' | 'level' | 'avatarKey'>>,
  ): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const params: (string | number)[] = [];
    if (fields.name !== undefined) {
      sets.push('name = ?');
      params.push(fields.name);
    }
    if (fields.level !== undefined) {
      sets.push('level = ?');
      params.push(fields.level);
    }
    if (fields.avatarKey !== undefined) {
      sets.push('avatar_key = ?');
      params.push(fields.avatarKey);
    }
    if (sets.length === 0) return;
    params.push(id);
    await db.runAsync(`UPDATE kid_profiles SET ${sets.join(', ')} WHERE id = ?`, ...params);
  }
  static async deleteProfile(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM kid_profiles WHERE id = ?', id);
  }
  static async getActiveKid(): Promise<KidProfile | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<KidProfileRow>(
      'SELECT * FROM kid_profiles WHERE is_active = 1 LIMIT 1',
    );
    return row ? rowToProfile(row) : null;
  }
  static async setActiveKid(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE kid_profiles SET is_active = 0');
    await db.runAsync('UPDATE kid_profiles SET is_active = 1 WHERE id = ?', id);
  }
}
