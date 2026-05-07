import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from './helpers';
import { runMigrations, getCurrentVersion, seedDefault } from '../schema';

describe('schema', () => {
  const { db, raw } = createTestDb();

  beforeEach(() => {
    raw.exec('DROP TABLE IF EXISTS schema_version');
    raw.exec('DROP TABLE IF EXISTS parent_account');
    raw.exec('DROP TABLE IF EXISTS kid_profile');
    raw.exec('DROP TABLE IF EXISTS session_log');
    raw.exec('DROP TABLE IF EXISTS session_event');
    raw.exec('DROP TABLE IF EXISTS question_attempt');
    raw.exec('DROP TABLE IF EXISTS syllabus_topic_tree');
    raw.exec('DROP TABLE IF EXISTS model_metadata');
    raw.exec('DROP TABLE IF EXISTS usage_counter');
  });

  describe('runMigrations', () => {
    it('creates schema_version table and applies v1', () => {
      const count = runMigrations(db);
      expect(count).toBe(1);

      const version = getCurrentVersion(db);
      expect(version).toBe(1);

      const tables = raw
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all() as Array<{ name: string }>;
      const names = tables.map((t) => t.name);
      expect(names).toContain('schema_version');
      expect(names).toContain('parent_account');
      expect(names).toContain('kid_profile');
      expect(names).toContain('session_log');
      expect(names).toContain('session_event');
      expect(names).toContain('question_attempt');
      expect(names).toContain('syllabus_topic_tree');
      expect(names).toContain('model_metadata');
      expect(names).toContain('usage_counter');
    });

    it('is idempotent — second run applies no new migrations', () => {
      runMigrations(db);
      const count = runMigrations(db);
      expect(count).toBe(0);
      expect(getCurrentVersion(db)).toBe(1);
    });
  });

  describe('seedDefault', () => {
    it('seeds syllabus topic tree on first run', () => {
      runMigrations(db);
      seedDefault(db);

      const rows = db.getAll<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM syllabus_topic_tree',
      );
      expect(rows[0].cnt).toBeGreaterThan(0);
    });

    it('is idempotent — does not duplicate on second seed', () => {
      runMigrations(db);
      seedDefault(db);
      const firstCount = db.getFirst<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM syllabus_topic_tree',
      )!.cnt;
      seedDefault(db);
      const secondCount = db.getFirst<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM syllabus_topic_tree',
      )!.cnt;
      expect(secondCount).toBe(firstCount);
    });
  });
});
