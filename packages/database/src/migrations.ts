import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { CURRENT_SCHEMA_VERSION, getMigrationStatements } from './schema'
export const META_TABLE = '_schema_version'
export async function ensureMetaTable(db: SQLiteDatabase): Promise<void> { await db.execAsync(`CREATE TABLE IF NOT EXISTS ${META_TABLE} (version INTEGER NOT NULL)`) }
export async function getCurrentVersion(db: SQLiteDatabase): Promise<number> { const r = await db.getFirstAsync<{version:number}>(`SELECT version FROM ${META_TABLE} ORDER BY rowid DESC LIMIT 1`); return r?.version ?? 0 }
export async function setVersion(db: SQLiteDatabase, v: number): Promise<void> { await db.runAsync(`INSERT INTO ${META_TABLE} (version) VALUES (?)`, v) }
export async function runMigrations(db: SQLiteDatabase, tv: number = CURRENT_SCHEMA_VERSION): Promise<void> {
  await ensureMetaTable(db); const cur = await getCurrentVersion(db); if (cur >= tv) return
  for (const stmt of getMigrationStatements(cur, tv)) { await db.execAsync(stmt) }; await setVersion(db, tv)
}
let _db: SQLiteDatabase | null = null; let _initP: Promise<SQLiteDatabase> | null = null
export async function getDatabase(dbName = 'tutor-sg.db'): Promise<SQLiteDatabase> { if (_db) return _db; if (_initP) return _initP; _initP = (async () => { const db = await openDatabaseAsync(dbName); await runMigrations(db); _db = db; return db })(); return _initP }
export async function resetDatabase(): Promise<void> { if (_db) { await _db.closeAsync(); _db = null }; _initP = null }
