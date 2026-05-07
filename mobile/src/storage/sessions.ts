/**
 * Kid homework sessions — SQLite storage.
 *
 * Schema aligns with the kid home screen's "recent sessions" feature.
 * Stores session metadata (subject, timestamp, question count) for
 * display on the kid home screen.
 *
 * NOTE: expo-sqlite v16 uses the async API (openDatabaseAsync).
 * For tests, the mock in __mocks__/expo-sqlite.ts returns a mock DB.
 */

import { openDatabaseAsync } from 'expo-sqlite';

export interface KidSession {
  id: number;
  subject: 'math' | 'english' | 'science' | 'chinese';
  questionCount: number;
  createdAt: string; // ISO 8601
}

const DB_NAME = 'tutor-sg.db';

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS kid_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject TEXT NOT NULL CHECK(subject IN ('math','english','science','chinese')),
          question_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

/**
 * Insert a new session record.
 */
export async function insertSession(
  subject: KidSession['subject'],
  questionCount: number,
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO kid_sessions (subject, question_count, created_at) VALUES (?, ?, ?)',
    subject,
    questionCount,
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

/**
 * Get the most recent N sessions, ordered by creation time descending.
 */
export async function getRecentSessions(limit = 3): Promise<KidSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    subject: string;
    question_count: number;
    created_at: string;
  }>(
    'SELECT id, subject, question_count, created_at FROM kid_sessions ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    subject: r.subject as KidSession['subject'],
    questionCount: r.question_count,
    createdAt: r.created_at,
  }));
}

/**
 * Get total session count (for stats / display).
 */
export async function getSessionCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM kid_sessions',
  );
  return row?.count ?? 0;
}

/**
 * Get a paginated page of sessions for the history screen.
 * Returns { sessions, total, hasMore } for easy FlatList pagination.
 */
export async function getPaginatedSessions(
  page: number,
  pageSize: number = 20,
): Promise<{
  sessions: KidSession[];
  total: number;
  hasMore: boolean;
}> {
  const db = await getDb();
  const offset = (page - 1) * pageSize;

  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM kid_sessions',
  );
  const total = countRow?.count ?? 0;

  const rows = await db.getAllAsync<{
    id: number;
    subject: string;
    question_count: number;
    created_at: string;
  }>(
    'SELECT id, subject, question_count, created_at FROM kid_sessions ORDER BY created_at DESC LIMIT ? OFFSET ?',
    pageSize,
    offset,
  );

  return {
    sessions: rows.map((r) => ({
      id: r.id,
      subject: r.subject as KidSession['subject'],
      questionCount: r.question_count,
      createdAt: r.created_at,
    })),
    total,
    hasMore: offset + pageSize < total,
  };
}
