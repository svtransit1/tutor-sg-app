import { getDb } from './database';

type Subject = 'math' | 'english' | 'science' | 'chinese';
type MasteryLevel = 'not_started' | 'beginner' | 'developing' | 'proficient' | 'mastered';

export interface KidProgressRow {
  id: number;
  kidProfileId: number;
  subject: Subject;
  topic: string;
  topicEn: string | null;
  topicZh: string | null;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTimeSpent: number;
  lastPracticedAt: string | null;
  masteryLevel: MasteryLevel;
}

export interface ProgressBySubject {
  subject: Subject;
  totalTopics: number;
  topicsStarted: number;
  topicsMastered: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number;
}

interface Row {
  id: number;
  kid_profile_id: number;
  subject: string;
  topic: string;
  topic_en: string | null;
  topic_zh: string | null;
  questions_attempted: number;
  questions_correct: number;
  total_time_spent: number;
  last_practiced_at: string | null;
  mastery_level: string;
}

function mapRow(row: Row): KidProgressRow {
  return {
    id: row.id,
    kidProfileId: row.kid_profile_id,
    subject: row.subject as Subject,
    topic: row.topic,
    topicEn: row.topic_en,
    topicZh: row.topic_zh,
    questionsAttempted: row.questions_attempted,
    questionsCorrect: row.questions_correct,
    totalTimeSpent: row.total_time_spent,
    lastPracticedAt: row.last_practiced_at,
    masteryLevel: row.mastery_level as MasteryLevel,
  };
}

export async function getOrCreateProgress(
  kidProfileId: number,
  subject: Subject,
  topic: string,
  topicEn?: string,
  topicZh?: string,
): Promise<KidProgressRow> {
  const db = await getDb();
  const existing = await db.getFirstAsync<Row>(
    `SELECT * FROM kid_progress
     WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
    kidProfileId,
    subject,
    topic,
  );
  if (existing) return mapRow(existing);

  await db.runAsync(
    `INSERT INTO kid_progress (kid_profile_id, subject, topic, topic_en, topic_zh)
     VALUES (?, ?, ?, ?, ?)`,
    kidProfileId,
    subject,
    topic,
    topicEn ?? null,
    topicZh ?? null,
  );

  const row = await db.getFirstAsync<Row>(
    `SELECT * FROM kid_progress
     WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
    kidProfileId,
    subject,
    topic,
  );
  return mapRow(row!);
}

export async function recordAnswer(
  kidProfileId: number,
  subject: Subject,
  topic: string,
  isCorrect: boolean,
  timeSpentSeconds: number = 0,
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  if (isCorrect) {
    await db.runAsync(
      `UPDATE kid_progress
       SET questions_attempted = questions_attempted + 1,
           questions_correct = questions_correct + 1,
           total_time_spent = total_time_spent + ?,
           last_practiced_at = ?,
           updated_at = ?
       WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
      timeSpentSeconds,
      now,
      now,
      kidProfileId,
      subject,
      topic,
    );
  } else {
    await db.runAsync(
      `UPDATE kid_progress
       SET questions_attempted = questions_attempted + 1,
           total_time_spent = total_time_spent + ?,
           last_practiced_at = ?,
           updated_at = ?
       WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
      timeSpentSeconds,
      now,
      now,
      kidProfileId,
      subject,
      topic,
    );
  }
}

export async function recomputeMastery(
  kidProfileId: number,
  subject: Subject,
  topic: string,
): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    `SELECT * FROM kid_progress
     WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
    kidProfileId,
    subject,
    topic,
  );
  if (!row || row.questions_attempted === 0) return;

  const accuracy = row.questions_correct / row.questions_attempted;

  let level: MasteryLevel;
  if (accuracy >= 0.9 && row.questions_attempted >= 10) {
    level = 'mastered';
  } else if (accuracy >= 0.75 && row.questions_attempted >= 5) {
    level = 'proficient';
  } else if (accuracy >= 0.5 && row.questions_attempted >= 3) {
    level = 'developing';
  } else if (row.questions_attempted >= 1) {
    level = 'beginner';
  } else {
    level = 'not_started';
  }

  await db.runAsync(
    `UPDATE kid_progress
     SET mastery_level = ?, updated_at = ?
     WHERE kid_profile_id = ? AND subject = ? AND topic = ?`,
    level,
    new Date().toISOString(),
    kidProfileId,
    subject,
    topic,
  );
}

export async function getProgressBySubject(
  kidProfileId: number = 1,
): Promise<ProgressBySubject[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    subject: string;
    total_topics: number;
    topics_started: number;
    topics_mastered: number;
    total_attempted: number;
    total_correct: number;
  }>(
    `SELECT
       subject,
       COUNT(*) as total_topics,
       SUM(CASE WHEN mastery_level != 'not_started' THEN 1 ELSE 0 END) as topics_started,
       SUM(CASE WHEN mastery_level = 'mastered' THEN 1 ELSE 0 END) as topics_mastered,
       COALESCE(SUM(questions_attempted), 0) as total_attempted,
       COALESCE(SUM(questions_correct), 0) as total_correct
     FROM kid_progress
     WHERE kid_profile_id = ?
     GROUP BY subject
     ORDER BY subject`,
    kidProfileId,
  );

  return rows.map((r) => ({
    subject: r.subject as Subject,
    totalTopics: r.total_topics,
    topicsStarted: r.topics_started,
    topicsMastered: r.topics_mastered,
    totalQuestionsAttempted: r.total_attempted,
    totalQuestionsCorrect: r.total_correct,
    overallAccuracy:
      r.total_attempted > 0
        ? Math.round((r.total_correct / r.total_attempted) * 100) / 100
        : 0,
  }));
}

export async function getProgressByTopic(
  kidProfileId: number,
  subject: Subject,
): Promise<KidProgressRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM kid_progress
     WHERE kid_profile_id = ? AND subject = ?
     ORDER BY mastery_level DESC, last_practiced_at DESC`,
    kidProfileId,
    subject,
  );
  return rows.map(mapRow);
}
