import { v4 as uuid } from 'uuid';

export interface DatabaseExecutor {
  exec(sql: string): void;
  run(sql: string, params?: unknown[]): { lastInsertRowId: number; changes: number };
  getAll<T>(sql: string, params?: unknown[]): T[];
  getFirst<T>(sql: string, params?: unknown[]): T | null;
}

export const TABLE_SCHEMA_VERSION = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const TABLE_PARENT_ACCOUNT = `
CREATE TABLE IF NOT EXISTS parent_account (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL CHECK(auth_provider IN ('email','google','apple')),
  auth_provider_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const TABLE_KID_PROFILE = `
CREATE TABLE IF NOT EXISTS kid_profile (
  id TEXT PRIMARY KEY,
  parent_account_id TEXT NOT NULL REFERENCES parent_account(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL CHECK(grade IN ('P1','P2','P3','P4','P5','P6')),
  subjects TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const TABLE_SESSION_LOG = `
CREATE TABLE IF NOT EXISTS session_log (
  id TEXT PRIMARY KEY,
  kid_profile_id TEXT NOT NULL REFERENCES kid_profile(id) ON DELETE CASCADE,
  subject TEXT CHECK(subject IN ('math','english','chinese_mt','science')),
  topic TEXT,
  device_tier TEXT NOT NULL DEFAULT 'high' CHECK(device_tier IN ('high','low','below_floor')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);
`;

export const TABLE_SESSION_EVENT = `
CREATE TABLE IF NOT EXISTS session_event (
  id TEXT PRIMARY KEY,
  session_log_id TEXT NOT NULL REFERENCES session_log(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(
    event_type IN (
      'photo_captured','question_detected','hint_shown','answer_revealed',
      'follow_up','manual_input','session_started','session_ended'
    )
  ),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  payload TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_session_event_session ON session_event(session_log_id);
CREATE INDEX IF NOT EXISTS idx_session_event_timestamp ON session_event(timestamp);
`;

export const TABLE_QUESTION_ATTEMPT = `
CREATE TABLE IF NOT EXISTS question_attempt (
  id TEXT PRIMARY KEY,
  session_log_id TEXT NOT NULL REFERENCES session_log(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  subject TEXT NOT NULL CHECK(subject IN ('math','english','chinese_mt','science')),
  topic TEXT NOT NULL DEFAULT '',
  answer TEXT,
  correct INTEGER,
  hints_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_question_attempt_session ON question_attempt(session_log_id);
`;

export const TABLE_SYLLABUS_TOPIC_TREE = `
CREATE TABLE IF NOT EXISTS syllabus_topic_tree (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL CHECK(subject IN ('math','english','chinese_mt','science')),
  level TEXT NOT NULL CHECK(level IN ('P1','P2','P3','P4','P5','P6')),
  topic_id TEXT NOT NULL,
  parent_topic_id TEXT,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  "sequence" INTEGER NOT NULL DEFAULT 0,
  UNIQUE(subject, level, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_syllabus_subject_level ON syllabus_topic_tree(subject, level);
CREATE INDEX IF NOT EXISTS idx_syllabus_parent ON syllabus_topic_tree(parent_topic_id);
`;

export const TABLE_MODEL_METADATA = `
CREATE TABLE IF NOT EXISTS model_metadata (
  id TEXT PRIMARY KEY,
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  quant TEXT NOT NULL,
  file_path TEXT NOT NULL,
  hash TEXT NOT NULL,
  downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  size_bytes INTEGER NOT NULL DEFAULT 0
);
`;

export const TABLE_USAGE_COUNTER = `
CREATE TABLE IF NOT EXISTS usage_counter (
  id TEXT PRIMARY KEY,
  kid_profile_id TEXT NOT NULL REFERENCES kid_profile(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  photo_count INTEGER NOT NULL DEFAULT 0,
  question_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(kid_profile_id, date)
);
CREATE INDEX IF NOT EXISTS idx_usage_counter_profile_date ON usage_counter(kid_profile_id, date);
`;

export const ALL_TABLES_SQL = [
  TABLE_SCHEMA_VERSION,
  TABLE_PARENT_ACCOUNT,
  TABLE_KID_PROFILE,
  TABLE_SESSION_LOG,
  TABLE_SESSION_EVENT,
  TABLE_QUESTION_ATTEMPT,
  TABLE_SYLLABUS_TOPIC_TREE,
  TABLE_MODEL_METADATA,
  TABLE_USAGE_COUNTER,
];

export const MIGRATIONS: Array<{ version: number; label: string; sql: string }> = [
  {
    version: 1,
    label: 'initial-schema',
    sql: ALL_TABLES_SQL.join('\n'),
  },
];

export function getCurrentVersion(db: DatabaseExecutor): number {
  try {
    const row = db.getFirst<{ version: number }>(
      'SELECT MAX(version) AS version FROM schema_version',
    );
    return row?.version ?? 0;
  } catch {
    return 0;
  }
}

export function runMigrations(db: DatabaseExecutor): number {
  db.exec(TABLE_SCHEMA_VERSION);

  const currentVersion = getCurrentVersion(db);
  let appliedCount = 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;

    db.exec(migration.sql);
    db.run('INSERT INTO schema_version (version) VALUES (?)', [migration.version]);
    appliedCount++;
  }

  return appliedCount;
}

export function seedDefault(db: DatabaseExecutor): void {
  const row = db.getFirst<{ cnt: number }>(
    'SELECT COUNT(*) AS cnt FROM syllabus_topic_tree',
  );
  if (row && row.cnt > 0) return;

  const topics: Array<{
    id: string;
    subject: string;
    level: string;
    topicId: string;
    parentTopicId: string | null;
    nameEn: string;
    nameZh: string;
    sequence: number;
  }> = [
    {
      id: uuid(),
      subject: 'math',
      level: 'P1',
      topicId: 'MATH_P1_NUMBERS',
      parentTopicId: null,
      nameEn: 'Numbers to 100',
      nameZh: '100以内的数字',
      sequence: 1,
    },
    {
      id: uuid(),
      subject: 'math',
      level: 'P1',
      topicId: 'MATH_P1_ADD_SUB',
      parentTopicId: null,
      nameEn: 'Addition & Subtraction',
      nameZh: '加减法',
      sequence: 2,
    },
    {
      id: uuid(),
      subject: 'english',
      level: 'P1',
      topicId: 'ENG_P1_READING',
      parentTopicId: null,
      nameEn: 'Reading Comprehension',
      nameZh: '阅读理解',
      sequence: 1,
    },
    {
      id: uuid(),
      subject: 'science',
      level: 'P3',
      topicId: 'SCI_P3_DIVERSITY',
      parentTopicId: null,
      nameEn: 'Diversity of Living Things',
      nameZh: '生物的多样性',
      sequence: 1,
    },
  ];

  const stmt =
    'INSERT INTO syllabus_topic_tree (id, subject, level, topic_id, parent_topic_id, name_en, name_zh, "sequence") VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  for (const t of topics) {
    db.run(stmt, [
      t.id,
      t.subject,
      t.level,
      t.topicId,
      t.parentTopicId,
      t.nameEn,
      t.nameZh,
      t.sequence,
    ]);
  }
}
