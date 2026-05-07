/**
 * Kid homework sessions — SQLite storage.
 *
 * Schema aligns with the kid home screen's "recent sessions" feature.
 * Stores session metadata (subject, timestamp, question count) for
 * display on the kid home screen, plus a session_events table for
 * appending OCR results, LLM prompts/responses, and kid follow-ups.
 *
 * NOTE: expo-sqlite v16 uses the async API (openDatabaseAsync).
 * For tests, the mock in __mocks__/expo-sqlite.ts returns a mock DB.
 */

import { openDatabaseAsync } from 'expo-sqlite'

export type Subject = 'math' | 'english' | 'science' | 'chinese'

export interface SessionEvent {
  id: number
  sessionId: number
  type: 'ocr' | 'llm_prompt' | 'llm_response' | 'kid_followup'
  payload: string // JSON string
  createdAt: string // ISO 8601
}

export interface KidSession {
  id: number
  subject: Subject
  questionCount: number
  createdAt: string // ISO 8601
  closedAt: string | null
}

// ---------------------------------------------------------------------------
// Internal types (matching DB column names)
// ---------------------------------------------------------------------------

interface SessionRow {
  id: number
  subject: string
  question_count: number
  created_at: string
  closed_at: string | null
}

interface EventRow {
  id: number
  session_id: number
  event_type: string
  payload: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const DB_NAME = 'tutor-sg.db'

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null

async function getDb() {
  if (!dbPromise) {
    const db = await openDatabaseAsync(DB_NAME)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS kid_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL CHECK(subject IN ('math','english','science','chinese')),
        question_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        closed_at TEXT
      );
      CREATE TABLE IF NOT EXISTS session_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES kid_sessions(id),
        event_type TEXT NOT NULL CHECK(event_type IN ('ocr','llm_prompt','llm_response','kid_followup')),
        payload TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
    dbPromise = Promise.resolve(db)
  }
  return dbPromise
}

// ---------------------------------------------------------------------------
// SessionRepository
// ---------------------------------------------------------------------------

export class SessionRepository {
  /**
   * Open a new session. Call when the camera opens.
   */
  static async createSession(subject: Subject): Promise<number> {
    const db = await getDb()
    const result = await db.runAsync(
      'INSERT INTO kid_sessions (subject, question_count, created_at) VALUES (?, ?, ?)',
      subject,
      0,
      new Date().toISOString(),
    )
    return result.lastInsertRowId
  }

  /**
   * Append an event to an open session.
   */
  static async addEvent(
    sessionId: number,
    type: SessionEvent['type'],
    payload: unknown,
  ): Promise<number> {
    const db = await getDb()
    const result = await db.runAsync(
      'INSERT INTO session_events (session_id, event_type, payload, created_at) VALUES (?, ?, ?, ?)',
      sessionId,
      type,
      JSON.stringify(payload),
      new Date().toISOString(),
    )
    return result.lastInsertRowId
  }

  /**
   * Close a session. After closing, no more events should be added.
   */
  static async closeSession(sessionId: number): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      'UPDATE kid_sessions SET closed_at = ? WHERE id = ?',
      new Date().toISOString(),
      sessionId,
    )
  }

  /**
   * Get a session with all its events, ordered chronologically.
   */
  static async getSessionWithEvents(sessionId: number): Promise<{
    session: KidSession
    events: SessionEvent[]
  } | null> {
    const db = await getDb()
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM kid_sessions WHERE id = ?',
      sessionId,
    )
    if (!rows.length) return null
    const row = rows[0]

    const eventRows = await db.getAllAsync<EventRow>(
      'SELECT * FROM session_events WHERE session_id = ? ORDER BY created_at ASC',
      sessionId,
    )

    return {
      session: {
        id: row.id,
        subject: row.subject as Subject,
        questionCount: row.question_count,
        createdAt: row.created_at,
        closedAt: row.closed_at,
      },
      events: eventRows.map((e) => ({
        id: e.id,
        sessionId: e.session_id,
        type: e.event_type as SessionEvent['type'],
        payload: e.payload,
        createdAt: e.created_at,
      })),
    }
  }

  /**
   * Get sessions created on a given date (YYYY-MM-DD), ordered newest-first.
   */
  static async getSessionsByDate(date: string): Promise<KidSession[]> {
    const db = await getDb()
    const rows = await db.getAllAsync<SessionRow>(
      `SELECT * FROM kid_sessions
       WHERE date(created_at) = ?
       ORDER BY created_at DESC`,
      date,
    )
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject as Subject,
      questionCount: r.question_count,
      createdAt: r.created_at,
      closedAt: r.closed_at,
    }))
  }

  /**
   * Get the most recent N sessions, ordered by creation time descending.
   */
  static async getRecentSessions(limit = 3): Promise<KidSession[]> {
    const db = await getDb()
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM kid_sessions ORDER BY created_at DESC LIMIT ?',
      limit,
    )
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject as Subject,
      questionCount: r.question_count,
      createdAt: r.created_at,
      closedAt: r.closed_at,
    }))
  }

  /**
   * Get total session count (for stats / display).
   */
  static async getSessionCount(): Promise<number> {
    const db = await getDb()
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM kid_sessions',
    )
    return row?.count ?? 0
  }
}
