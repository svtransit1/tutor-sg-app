import { getDb } from './database';

type Subject = 'math' | 'english' | 'science' | 'chinese';

export interface KidSession {
  id: number;
  subject: Subject;
  questionCount: number;
  timeSpent: number;
  topic: string | null;
  topicEn: string | null;
  topicZh: string | null;
  createdAt: string;
}

export interface KidSessionRow {
  id: number;
  kid_profile_id: number;
  subject: string;
  topic: string | null;
  topic_en: string | null;
  topic_zh: string | null;
  question_count: number;
  time_spent: number;
  status: string;
  struggle_indicators: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  ai_help_summary_en: string | null;
  ai_help_summary_zh: string | null;
  parent_flagged: number;
  parent_flag_note: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: KidSessionRow): KidSession {
  return {
    id: row.id,
    subject: row.subject as Subject,
    questionCount: row.question_count,
    timeSpent: row.time_spent,
    topic: row.topic,
    topicEn: row.topic_en,
    topicZh: row.topic_zh,
    createdAt: row.created_at,
  };
}

export async function insertSession(
  subject: Subject,
  questionCount: number,
  timeSpent: number = 0,
  options?: {
    topic?: string;
    topicEn?: string;
    topicZh?: string;
  },
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO kid_sessions (subject, question_count, time_spent, created_at, topic, topic_en, topic_zh)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    subject,
    questionCount,
    timeSpent,
    new Date().toISOString(),
    options?.topic ?? null,
    options?.topicEn ?? null,
    options?.topicZh ?? null,
  );
  return result.lastInsertRowId;
}

export async function getRecentSessions(limit = 3): Promise<KidSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<KidSessionRow>(
    `SELECT id, kid_profile_id, subject, topic, topic_en, topic_zh,
            question_count, time_spent, status, struggle_indicators,
            summary_en, summary_zh, ai_help_summary_en, ai_help_summary_zh,
            parent_flagged, parent_flag_note, created_at, updated_at
     FROM kid_sessions
     ORDER BY created_at DESC
     LIMIT ?`,
    limit,
  );
  return rows.map(mapRow);
}

export async function getSessionCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM kid_sessions',
  );
  return row?.count ?? 0;
}

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

  const rows = await db.getAllAsync<KidSessionRow>(
    `SELECT id, kid_profile_id, subject, topic, topic_en, topic_zh,
            question_count, time_spent, status, struggle_indicators,
            summary_en, summary_zh, ai_help_summary_en, ai_help_summary_zh,
            parent_flagged, parent_flag_note, created_at, updated_at
     FROM kid_sessions
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    pageSize,
    offset,
  );

  return {
    sessions: rows.map(mapRow),
    total,
    hasMore: offset + pageSize < total,
  };
}
