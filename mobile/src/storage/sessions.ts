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
   * Increment question_count by 1 for a session.
   */
  static async incrementQuestionCount(sessionId: number): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      'UPDATE kid_sessions SET question_count = question_count + 1 WHERE id = ?',
      sessionId,
    )
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
   * Get all sessions grouped by date for the parent dashboard.
   * Returns { dateLabel, sessions[] } groups: "Today", "Yesterday", "This Week", "Older".
   */
  static async getSessionsForParent(limit = 50): Promise<
    { label: string; sessions: KidSession[] }[]
  > {
    const db = await getDb()
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM kid_sessions ORDER BY created_at DESC LIMIT ?',
      limit,
    )

    const sessions: KidSession[] = rows.map((r) => ({
      id: r.id,
      subject: r.subject as Subject,
      questionCount: r.question_count,
      createdAt: r.created_at,
      closedAt: r.closed_at,
    }))

    const groups: { label: string; sessions: KidSession[] }[] = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const todaySessions: KidSession[] = []
    const yesterdaySessions: KidSession[] = []
    const weekSessions: KidSession[] = []
    const olderSessions: KidSession[] = []

    for (const s of sessions) {
      const dateStr = s.createdAt.split('T')[0]
      if (dateStr === todayStr) todaySessions.push(s)
      else if (dateStr === yesterdayStr) yesterdaySessions.push(s)
      else if (dateStr >= weekStartStr) weekSessions.push(s)
      else olderSessions.push(s)
    }

    if (todaySessions.length) groups.push({ label: 'today', sessions: todaySessions })
    if (yesterdaySessions.length) groups.push({ label: 'yesterday', sessions: yesterdaySessions })
    if (weekSessions.length) groups.push({ label: 'thisWeek', sessions: weekSessions })
    if (olderSessions.length) groups.push({ label: 'older', sessions: olderSessions })

    return groups
  }

  /**
   * Get summary stats for a session: total events, duration in minutes.
   */
  static async getSessionSummary(sessionId: number): Promise<{
    eventCount: number
    durationMinutes: number | null
  } | null> {
    const full = await this.getSessionWithEvents(sessionId)
    if (!full) return null

    const durationMinutes =
      full.session.closedAt
        ? Math.round(
            (new Date(full.session.closedAt).getTime() -
              new Date(full.session.createdAt).getTime()) /
              60000,
          )
        : null

    return { eventCount: full.events.length, durationMinutes }
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

// ---- Convenience named exports (delegate to SessionRepository) ----

export const getRecentSessions = SessionRepository.getRecentSessions.bind(SessionRepository)
export const createSession = SessionRepository.createSession.bind(SessionRepository)
export const addEvent = SessionRepository.addEvent.bind(SessionRepository)
export const closeSession = SessionRepository.closeSession.bind(SessionRepository)
export const incrementQuestionCount = SessionRepository.incrementQuestionCount.bind(SessionRepository)
export const getSessionsByDate = SessionRepository.getSessionsByDate.bind(SessionRepository)
export const getSessionWithEvents = SessionRepository.getSessionWithEvents.bind(SessionRepository)
export const getSessionCount = SessionRepository.getSessionCount.bind(SessionRepository)
export const getSessionsForParent = SessionRepository.getSessionsForParent.bind(SessionRepository)
export const getSessionSummary = SessionRepository.getSessionSummary.bind(SessionRepository)
