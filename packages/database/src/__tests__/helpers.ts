import Database from 'better-sqlite3';
import type { DatabaseExecutor } from '../schema';

export function createTestDb(): { db: DatabaseExecutor; raw: Database.Database } {
  const raw = new Database(':memory:');
  raw.pragma('journal_mode = WAL');
  raw.pragma('foreign_keys = ON');

  const db: DatabaseExecutor = {
    exec(sql: string) {
      raw.exec(sql);
    },
    run(sql: string, params?: unknown[]) {
      const stmt = raw.prepare(sql);
      const result = stmt.run(...(params ?? []));
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
      };
    },
    getAll<T>(sql: string, params?: unknown[]) {
      const stmt = raw.prepare(sql);
      return stmt.all(...(params ?? [])) as T[];
    },
    getFirst<T>(sql: string, params?: unknown[]) {
      const stmt = raw.prepare(sql);
      return (stmt.get(...(params ?? [])) as T) ?? null;
    },
  };

  return { db, raw };
}
