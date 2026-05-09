import { openDatabaseAsync } from 'expo-sqlite';

export const DB_NAME = 'tutor-sg.db';

const DDL = `
  CREATE TABLE IF NOT EXISTS kid_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kid_profile_id INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL CHECK(subject IN ('math','english','science','chinese')),
    topic TEXT,
    topic_en TEXT,
    topic_zh TEXT,
    question_count INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('in_progress','completed','abandoned')),
    struggle_indicators TEXT,
    summary_en TEXT,
    summary_zh TEXT,
    ai_help_summary_en TEXT,
    ai_help_summary_zh TEXT,
    parent_flagged INTEGER NOT NULL DEFAULT 0,
    parent_flag_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN (
      'question_attempted','hint_shown','answer_given',
      'struggle_detected','help_requested','solution_shown',
      'confidence_rating','flag_raised','session_ended'
    )),
    payload TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES kid_sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kid_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kid_profile_id INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL CHECK(subject IN ('math','english','science','chinese')),
    topic TEXT NOT NULL,
    topic_en TEXT,
    topic_zh TEXT,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    total_time_spent INTEGER NOT NULL DEFAULT 0,
    last_practiced_at TEXT,
    mastery_level TEXT NOT NULL DEFAULT 'not_started' CHECK(mastery_level IN ('not_started','beginner','developing','proficient','mastered')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(kid_profile_id, subject, topic)
  );

  CREATE TABLE IF NOT EXISTS kid_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),
    avatar_emoji TEXT DEFAULT '🐱',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parent_pin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin_hash TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_kid ON kid_sessions(kid_profile_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_parent_flag ON kid_sessions(parent_flagged);
  CREATE INDEX IF NOT EXISTS idx_events_session ON session_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_progress_kid_subject ON kid_progress(kid_profile_id, subject);
  CREATE INDEX IF NOT EXISTS idx_progress_mastery ON kid_progress(mastery_level);
`;

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

export async function getDb(): Promise<ReturnType<typeof openDatabaseAsync>> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(DDL);
      return db;
    });
  }
  return dbPromise;
}

export function resetDb(): void {
  dbPromise = null;
}
