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

/**
 * Full homework session — includes the complete inference result JSON
 * for display on the parent log and camera result screen.
 */
export interface FullHomeworkSession {
  id: number;
  sessionId: string;       // UUID from the LLM bridge
  subject: string;         // 'math' | 'english' | 'science' | 'chinese_mt'
  grade: string;           // 'P1' – 'P6'
  questionCount: number;
  inferenceResult: string; // JSON-stringified InferenceResponse
  createdAt: string;       // ISO 8601
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
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS homework_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL UNIQUE,
          subject TEXT NOT NULL,
          grade TEXT NOT NULL,
          question_count INTEGER NOT NULL DEFAULT 0,
          inference_result TEXT NOT NULL DEFAULT '{}',
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

// ── Full Homework Sessions ─────────────────────────────────────────

/**
 * Insert a full homework session with inference result.
 */
export async function insertFullSession(session: {
  sessionId: string;
  subject: string;
  grade: string;
  questionCount: number;
  inferenceResult: string;
}): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT OR REPLACE INTO homework_sessions
     (session_id, subject, grade, question_count, inference_result, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    session.sessionId,
    session.subject,
    session.grade,
    session.questionCount,
    session.inferenceResult,
    new Date().toISOString(),
  );

  // Also insert a lightweight entry into kid_sessions for the home screen
  const subject = (
    ['math', 'english', 'science', 'chinese', 'chinese_mt'].includes(
      session.subject,
    )
      ? session.subject
      : 'math'
  ) as KidSession['subject'];
  await db.runAsync(
    'INSERT INTO kid_sessions (subject, question_count, created_at) VALUES (?, ?, ?)',
    subject,
    session.questionCount,
    new Date().toISOString(),
  );

  return result.lastInsertRowId;
}

/**
 * Get a full homework session by its UUID session ID.
 */
export async function getSessionById(
  sessionId: string,
): Promise<FullHomeworkSession | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{
      id: number;
      session_id: string;
      subject: string;
      grade: string;
      question_count: number;
      inference_result: string;
      created_at: string;
    }>(
      'SELECT id, session_id, subject, grade, question_count, inference_result, created_at FROM homework_sessions WHERE session_id = ?',
      sessionId,
    );

    if (!row) return null;

    return {
      id: row.id,
      sessionId: row.session_id,
      subject: row.subject,
      grade: row.grade,
      questionCount: row.question_count,
      inferenceResult: row.inference_result,
      createdAt: row.created_at,
    };
  } catch (err) {
    console.error('Failed to get session by ID:', err);
    return null;
  }
}

/**
 * Get all homework sessions for the parent log, most recent first.
 */
export async function getAllHomeworkSessions(
  limit = 50,
): Promise<FullHomeworkSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    session_id: string;
    subject: string;
    grade: string;
    question_count: number;
    inference_result: string;
    created_at: string;
  }>(
    'SELECT id, session_id, subject, grade, question_count, inference_result, created_at FROM homework_sessions ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    subject: r.subject,
    grade: r.grade,
    questionCount: r.question_count,
    inferenceResult: r.inference_result,
    createdAt: r.created_at,
  }));
}
