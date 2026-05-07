export const CURRENT_SCHEMA_VERSION = 1
export const SCHEMA_DDL: Record<number, string[]> = {
  1: [
    "CREATE TABLE IF NOT EXISTS parent_account (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, auth_provider TEXT NOT NULL CHECK(auth_provider IN ('email','google','apple')), auth_provider_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS kid_profile (id TEXT PRIMARY KEY, parent_account_id TEXT NOT NULL REFERENCES parent_account(id) ON DELETE CASCADE, name TEXT NOT NULL, grade TEXT NOT NULL CHECK(grade IN ('P1','P2','P3','P4','P5','P6')), subjects TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS session_log (id TEXT PRIMARY KEY, kid_profile_id TEXT NOT NULL REFERENCES kid_profile(id) ON DELETE CASCADE, subject TEXT CHECK(subject IS NULL OR subject IN ('math','english','chinese_mt','science')), topic TEXT, device_tier TEXT NOT NULL CHECK(device_tier IN ('high','low','below_floor')), started_at TEXT NOT NULL, ended_at TEXT)",
    "CREATE TABLE IF NOT EXISTS session_event (id TEXT PRIMARY KEY, session_log_id TEXT NOT NULL REFERENCES session_log(id) ON DELETE CASCADE, event_type TEXT NOT NULL CHECK(event_type IN ('photo_captured','question_detected','hint_shown','answer_revealed','follow_up','manual_input','session_started','session_ended')), timestamp TEXT NOT NULL, payload TEXT NOT NULL DEFAULT '{}')",
    "CREATE TABLE IF NOT EXISTS question_attempt (id TEXT PRIMARY KEY, session_log_id TEXT NOT NULL REFERENCES session_log(id) ON DELETE CASCADE, question_text TEXT NOT NULL, subject TEXT NOT NULL CHECK(subject IN ('math','english','chinese_mt','science')), topic TEXT NOT NULL, answer TEXT, correct INTEGER, hints_used INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS syllabus_topic_tree (id TEXT PRIMARY KEY, subject TEXT NOT NULL CHECK(subject IN ('math','english','chinese_mt','science')), level TEXT NOT NULL CHECK(level IN ('P1','P2','P3','P4','P5','P6')), topic_id TEXT NOT NULL, parent_topic_id TEXT, name_en TEXT NOT NULL, name_zh TEXT NOT NULL, sequence INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS model_metadata (id TEXT PRIMARY KEY, model_name TEXT NOT NULL, version TEXT NOT NULL, quant TEXT NOT NULL, file_path TEXT NOT NULL, hash TEXT NOT NULL, downloaded_at TEXT NOT NULL, size_bytes INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS usage_counter (id TEXT PRIMARY KEY, kid_profile_id TEXT NOT NULL REFERENCES kid_profile(id) ON DELETE CASCADE, date TEXT NOT NULL, photo_count INTEGER NOT NULL DEFAULT 0, question_count INTEGER NOT NULL DEFAULT 0)",
    "CREATE INDEX IF NOT EXISTS idx_session_log_kid ON session_log(kid_profile_id)",
    "CREATE INDEX IF NOT EXISTS idx_session_log_started ON session_log(started_at)",
    "CREATE INDEX IF NOT EXISTS idx_session_event_log ON session_event(session_log_id)",
    "CREATE INDEX IF NOT EXISTS idx_question_attempt_log ON question_attempt(session_log_id)",
    "CREATE INDEX IF NOT EXISTS idx_syllabus_subject_level ON syllabus_topic_tree(subject, level)",
    "CREATE INDEX IF NOT EXISTS idx_syllabus_parent ON syllabus_topic_tree(parent_topic_id)",
    "CREATE INDEX IF NOT EXISTS idx_usage_kid_date ON usage_counter(kid_profile_id, date)",
  ],
}
export function getMigrationStatements(fromVersion: number, toVersion: number): string[] {
  const s: string[] = []; for (let v = fromVersion + 1; v <= toVersion; v++) { const d = SCHEMA_DDL[v]; if (d) s.push(...d) }; return s
}
