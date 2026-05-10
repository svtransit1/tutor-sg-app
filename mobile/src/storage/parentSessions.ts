import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'

export type ParentSubject = 'math' | 'english' | 'chinese' | 'science' | 'humanities' | 'arts' | 'music' | 'other'

interface ParentSessionRow {
  id: string
  kid_profile_id: string
  subject: string
  topic: string
  started_at: string
  ended_at: string | null
  questions_attempted: number
  questions_correct: number
  struggle_indicators: string
  ai_summary: string | null
  parent_flagged: number
  flag_reason: string | null
  flag_timestamp: string | null
}

export interface ParentSession {
  id: string
  kidProfileId: string
  subject: ParentSubject
  topic: string
  startedAt: string
  endedAt: string | null
  questionsAttempted: number
  questionsCorrect: number
  struggleIndicators: boolean[]
  aiSummary: string | null
  parentFlagged: boolean
  flagReason: string | null
  flagTimestamp: string | null
}

export interface QuestionAttempt {
  id: number
  sessionId: string
  questionId: string
  correct: boolean
  hintsUsed: number
  timeSeconds: number
  struggleDetected: boolean
  loggedAt: string
}

export interface FlagImprovementRow {
  topic_id: string
  subject: string
  level: number
  flag_count: number
  avg_difficulty: string | null
  common_reasons: string
  suggestions: string
  last_analyzed: string | null
}

const DB_NAME = 'tutorSG.db'

let _db: SQLiteDatabase | null = null

async function getDb(): Promise<SQLiteDatabase> {
  if (!_db) {
    const db = await openDatabaseAsync(DB_NAME)
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS parent_sessions (id TEXT PRIMARY KEY, kid_profile_id TEXT NOT NULL, subject TEXT NOT NULL, topic TEXT NOT NULL DEFAULT '', started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT, questions_attempted INTEGER NOT NULL DEFAULT 0, questions_correct INTEGER NOT NULL DEFAULT 0, struggle_indicators TEXT NOT NULL DEFAULT '[]', ai_summary TEXT, parent_flagged INTEGER NOT NULL DEFAULT 0);"
      + "CREATE TABLE IF NOT EXISTS question_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, question_id TEXT NOT NULL, correct INTEGER NOT NULL, hints_used INTEGER NOT NULL DEFAULT 0, time_seconds INTEGER NOT NULL DEFAULT 0, struggle_detected INTEGER NOT NULL DEFAULT 0, logged_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (session_id) REFERENCES parent_sessions(id));"
      + "CREATE TABLE IF NOT EXISTS flag_improvement_analysis (topic_id TEXT PRIMARY KEY, subject TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 0, flag_count INTEGER NOT NULL DEFAULT 0, avg_difficulty TEXT, common_reasons TEXT NOT NULL DEFAULT '[]', suggestions TEXT NOT NULL DEFAULT '[]', last_analyzed TEXT);",
    )
    await migrateSchema(db)
    _db = db
  }
  return _db
}

async function migrateSchema(db: SQLiteDatabase): Promise<void> {
  for (const col of ['flag_reason', 'flag_timestamp']) {
    try { await db.runAsync(`ALTER TABLE parent_sessions ADD COLUMN ${col} TEXT`) } catch { /* column may already exist */ }
  }
}

export function __resetDb(): void {
  _db = null
}

function rowToSession(row: ParentSessionRow): ParentSession {
  return {
    id: row.id, kidProfileId: row.kid_profile_id, subject: row.subject as ParentSubject, topic: row.topic,
    startedAt: row.started_at, endedAt: row.ended_at,
    questionsAttempted: row.questions_attempted, questionsCorrect: row.questions_correct,
    struggleIndicators: JSON.parse(row.struggle_indicators || '[]'),
    aiSummary: row.ai_summary, parentFlagged: row.parent_flagged === 1,
    flagReason: row.flag_reason ?? null, flagTimestamp: row.flag_timestamp ?? null,
  }
}

export class ParentSessionRepository {
  static async startSession(kidProfileId: string, subject: ParentSubject, topic = ''): Promise<string> {
    const db = await getDb()
    const id = crypto.randomUUID()
    await db.runAsync("INSERT INTO parent_sessions (id, kid_profile_id, subject, topic, started_at) VALUES (?, ?, ?, ?, datetime('now'))", id, kidProfileId, subject, topic)
    return id
  }
  static async logQuestionAttempt(sessionId: string, questionId: string, correct: boolean, hintsUsed: number, timeSeconds: number, struggleDetected: boolean): Promise<void> {
    const db = await getDb()
    await db.runAsync("INSERT INTO question_attempts (session_id, question_id, correct, hints_used, time_seconds, struggle_detected) VALUES (?, ?, ?, ?, ?, ?)", sessionId, questionId, correct ? 1 : 0, hintsUsed, timeSeconds, struggleDetected ? 1 : 0)
    await db.runAsync("UPDATE parent_sessions SET questions_attempted = questions_attempted + 1, questions_correct = questions_correct + ?, struggle_indicators = struggle_indicators || ? WHERE id = ?", correct ? 1 : 0, struggleDetected ? '1' : '0', sessionId)
  }
  static async endSession(sessionId: string, aiSummary: string, parentFlagged: boolean): Promise<void> {
    const db = await getDb()
    await db.runAsync("UPDATE parent_sessions SET ended_at = datetime('now'), ai_summary = ?, parent_flagged = ? WHERE id = ?", aiSummary, parentFlagged ? 1 : 0, sessionId)
  }
  static async getSession(id: string): Promise<ParentSession | null> {
    const db = await getDb()
    const row = await db.getFirstAsync<ParentSessionRow>('SELECT * FROM parent_sessions WHERE id = ?', id)
    return row ? rowToSession(row) : null
  }
  static async getSessionsForKid(kidProfileId: string): Promise<ParentSession[]> {
    const db = await getDb()
    const rows = await db.getAllAsync<ParentSessionRow>('SELECT * FROM parent_sessions WHERE kid_profile_id = ? ORDER BY started_at ASC', kidProfileId)
    return rows.map(rowToSession)
  }
  static async getFlaggedSessions(kidProfileId: string): Promise<ParentSession[]> {
    const db = await getDb()
    const rows = await db.getAllAsync<ParentSessionRow>('SELECT * FROM parent_sessions WHERE kid_profile_id = ? AND parent_flagged = 1 ORDER BY flag_timestamp DESC', kidProfileId)
    return rows.map(rowToSession)
  }
  static async getQuestionAttemptsForSession(sessionId: string): Promise<QuestionAttempt[]> {
    const db = await getDb()
    const rows = await db.getAllAsync<{ id: number; session_id: string; question_id: string; correct: number; hints_used: number; time_seconds: number; struggle_detected: number; logged_at: string }>('SELECT * FROM question_attempts WHERE session_id = ? ORDER BY logged_at ASC', sessionId)
    return rows.map((r) => ({ id: r.id, sessionId: r.session_id, questionId: r.question_id, correct: r.correct === 1, hintsUsed: r.hints_used, timeSeconds: r.time_seconds, struggleDetected: r.struggle_detected === 1, loggedAt: r.logged_at }))
  }
  static async setParentFlagged(sessionId: string, flagged: boolean, reason?: string): Promise<void> {
    const db = await getDb()
    if (flagged) {
      await db.runAsync('UPDATE parent_sessions SET parent_flagged = 1, flag_reason = ?, flag_timestamp = ? WHERE id = ?', reason ?? null, new Date().toISOString(), sessionId)
    } else {
      await db.runAsync('UPDATE parent_sessions SET parent_flagged = 0, flag_reason = NULL, flag_timestamp = NULL WHERE id = ?', sessionId)
    }
  }
  static async getFlagImprovementForTopic(topicId: string): Promise<FlagImprovementRow | null> {
    const db = await getDb()
    return db.getFirstAsync<FlagImprovementRow>('SELECT * FROM flag_improvement_analysis WHERE topic_id = ?', topicId)
  }
  static async getAllFlagImprovements(): Promise<FlagImprovementRow[]> {
    const db = await getDb()
    return db.getAllAsync<FlagImprovementRow>('SELECT * FROM flag_improvement_analysis ORDER BY flag_count DESC')
  }
  static async upsertFlagImprovement(row: Omit<FlagImprovementRow, 'last_analyzed'> & { last_analyzed: string | null }): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      'INSERT OR REPLACE INTO flag_improvement_analysis (topic_id, subject, level, flag_count, avg_difficulty, common_reasons, suggestions, last_analyzed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      row.topic_id, row.subject, row.level, row.flag_count, row.avg_difficulty ?? null, row.common_reasons, row.suggestions, row.last_analyzed ?? new Date().toISOString(),
    )
  }
}
