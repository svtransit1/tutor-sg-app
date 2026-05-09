import { getDb } from './database';

type Subject = 'math' | 'english' | 'science' | 'chinese';
type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
type SessionEventType =
  | 'question_attempted'
  | 'hint_shown'
  | 'answer_given'
  | 'struggle_detected'
  | 'help_requested'
  | 'solution_shown'
  | 'confidence_rating'
  | 'flag_raised'
  | 'session_ended';

export interface ParentSessionSummary {
  id: number;
  kidProfileId: number;
  subject: Subject;
  topic: string | null;
  topicEn: string | null;
  topicZh: string | null;
  questionCount: number;
  timeSpent: number;
  status: SessionStatus;
  struggleIndicators: string | null;
  summaryEn: string | null;
  summaryZh: string | null;
  aiHelpSummaryEn: string | null;
  aiHelpSummaryZh: string | null;
  parentFlagged: boolean;
  parentFlagNote: string | null;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  sessionCount: number;
  totalTimeSpent: number;
  totalQuestions: number;
  subjects: Subject[];
}

export interface SessionEventRow {
  id: number;
  session_id: number;
  event_type: string;
  payload: string | null;
  created_at: string;
}

function mapSessionRow(row: Record<string, unknown>): ParentSessionSummary {
  return {
    id: row.id as number,
    kidProfileId: row.kid_profile_id as number,
    subject: row.subject as Subject,
    topic: (row.topic as string) ?? null,
    topicEn: (row.topic_en as string) ?? null,
    topicZh: (row.topic_zh as string) ?? null,
    questionCount: row.question_count as number,
    timeSpent: row.time_spent as number,
    status: row.status as SessionStatus,
    struggleIndicators: (row.struggle_indicators as string) ?? null,
    summaryEn: (row.summary_en as string) ?? null,
    summaryZh: (row.summary_zh as string) ?? null,
    aiHelpSummaryEn: (row.ai_help_summary_en as string) ?? null,
    aiHelpSummaryZh: (row.ai_help_summary_zh as string) ?? null,
    parentFlagged: (row.parent_flagged as number) === 1,
    parentFlagNote: (row.parent_flag_note as string) ?? null,
    createdAt: row.created_at as string,
  };
}

const SESSION_COLUMNS = `
  id, kid_profile_id, subject, topic, topic_en, topic_zh,
  question_count, time_spent, status, struggle_indicators,
  summary_en, summary_zh, ai_help_summary_en, ai_help_summary_zh,
  parent_flagged, parent_flag_note, created_at, updated_at
`;

export async function getParentSessionById(
  sessionId: number,
): Promise<ParentSessionSummary | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT ${SESSION_COLUMNS} FROM kid_sessions WHERE id = ?`,
    sessionId,
  );
  return row ? mapSessionRow(row) : null;
}

export async function getSessionsForParent(
  kidProfileId: number = 1,
  days: number = 7,
): Promise<ParentSessionSummary[]> {
  const db = await getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT ${SESSION_COLUMNS}
     FROM kid_sessions
     WHERE kid_profile_id = ? AND created_at >= ?
     ORDER BY created_at DESC`,
    kidProfileId,
    cutoff.toISOString(),
  );
  return rows.map(mapSessionRow);
}

export async function getDailySummaries(
  kidProfileId: number = 1,
  days: number = 7,
): Promise<DailySummary[]> {
  const db = await getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rows = await db.getAllAsync<{
    date: string;
    session_count: number;
    total_time_spent: number;
    total_questions: number;
  }>(
    `SELECT DATE(created_at) as date,
            COUNT(*) as session_count,
            COALESCE(SUM(time_spent), 0) as total_time_spent,
            COALESCE(SUM(question_count), 0) as total_questions
     FROM kid_sessions
     WHERE kid_profile_id = ? AND created_at >= ?
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    kidProfileId,
    cutoff.toISOString(),
  );

  const summaries: DailySummary[] = [];
  for (const row of rows) {
    const subjectRows = await db.getAllAsync<{ subject: string }>(
      `SELECT DISTINCT subject FROM kid_sessions
       WHERE kid_profile_id = ? AND DATE(created_at) = ?
       ORDER BY subject`,
      kidProfileId,
      row.date,
    );
    summaries.push({
      date: row.date,
      sessionCount: row.session_count,
      totalTimeSpent: row.total_time_spent,
      totalQuestions: row.total_questions,
      subjects: subjectRows.map((s) => s.subject as Subject),
    });
  }
  return summaries;
}

export async function getFlaggedSessions(
  kidProfileId: number = 1,
): Promise<ParentSessionSummary[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT ${SESSION_COLUMNS}
     FROM kid_sessions
     WHERE kid_profile_id = ? AND parent_flagged = 1
     ORDER BY created_at DESC`,
    kidProfileId,
  );
  return rows.map(mapSessionRow);
}

export async function flagSession(
  sessionId: number,
  note: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE kid_sessions
     SET parent_flagged = 1, parent_flag_note = ?, updated_at = ?
     WHERE id = ?`,
    note,
    new Date().toISOString(),
    sessionId,
  );
}

export async function unflagSession(sessionId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE kid_sessions
     SET parent_flagged = 0, parent_flag_note = NULL, updated_at = ?
     WHERE id = ?`,
    new Date().toISOString(),
    sessionId,
  );
}

export async function updateSessionSummary(
  sessionId: number,
  summary: {
    summaryEn?: string;
    summaryZh?: string;
    aiHelpSummaryEn?: string;
    aiHelpSummaryZh?: string;
  },
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: (string | null)[] = [];

  if (summary.summaryEn !== undefined) {
    updates.push('summary_en = ?');
    params.push(summary.summaryEn);
  }
  if (summary.summaryZh !== undefined) {
    updates.push('summary_zh = ?');
    params.push(summary.summaryZh);
  }
  if (summary.aiHelpSummaryEn !== undefined) {
    updates.push('ai_help_summary_en = ?');
    params.push(summary.aiHelpSummaryEn);
  }
  if (summary.aiHelpSummaryZh !== undefined) {
    updates.push('ai_help_summary_zh = ?');
    params.push(summary.aiHelpSummaryZh);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  params.push(now);
  params.push(sessionId as unknown as string);

  await db.runAsync(
    `UPDATE kid_sessions SET ${updates.join(', ')} WHERE id = ?`,
    ...params,
  );
}

export async function insertSessionEvent(
  sessionId: number,
  eventType: SessionEventType,
  payload?: Record<string, unknown>,
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO session_events (session_id, event_type, payload, created_at)
     VALUES (?, ?, ?, ?)`,
    sessionId,
    eventType,
    payload ? JSON.stringify(payload) : null,
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

export async function getSessionEvents(
  sessionId: number,
): Promise<SessionEventRow[]> {
  const db = await getDb();
  return db.getAllAsync<SessionEventRow>(
    `SELECT id, session_id, event_type, payload, created_at
     FROM session_events
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    sessionId,
  );
}
