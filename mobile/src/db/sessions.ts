import * as SQLite from 'expo-sqlite';
import { HomeworkSession, FeedbackBlock, OcrResult } from '../types/homework';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('tutor-sg.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        level TEXT NOT NULL,
        ocr_json TEXT,
        feedback_json TEXT,
        raw_llm_response TEXT,
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        status TEXT NOT NULL DEFAULT 'capturing'
      );
    `);
  }
  return db;
}

export async function saveSession(session: HomeworkSession): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO sessions (id, subject, level, ocr_json, feedback_json, raw_llm_response, started_at, completed_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.subject,
      session.level,
      session.ocrResult ? JSON.stringify(session.ocrResult) : null,
      JSON.stringify(session.feedbackBlocks),
      session.rawLlmResponse,
      session.startedAt,
      session.completedAt,
      session.status,
    ],
  );
}

export async function getSessions(limit: number = 20): Promise<HomeworkSession[]> {
  const database = await getDb();
  const rows = await database.getAllAsync(
    'SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?',
    [limit],
  ) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    ocrResult: row.ocr_json ? JSON.parse(row.ocr_json as string) : null,
    subject: row.subject as string,
    level: row.level as string,
    feedbackBlocks: row.feedback_json ? JSON.parse(row.feedback_json as string) : [],
    rawLlmResponse: (row.raw_llm_response as string) ?? '',
    startedAt: row.started_at as number,
    completedAt: (row.completed_at as number) ?? null,
    status: row.status as HomeworkSession['status'],
  }));
}

export async function getSession(id: string): Promise<HomeworkSession | null> {
  const database = await getDb();
  const row = await database.getFirstAsync('SELECT * FROM sessions WHERE id = ?', [id]) as Record<string, unknown> | null;
  if (!row) return null;

  return {
    id: row.id as string,
    ocrResult: row.ocr_json ? JSON.parse(row.ocr_json as string) : null,
    subject: row.subject as string,
    level: row.level as string,
    feedbackBlocks: row.feedback_json ? JSON.parse(row.feedback_json as string) : [],
    rawLlmResponse: (row.raw_llm_response as string) ?? '',
    startedAt: row.started_at as number,
    completedAt: (row.completed_at as number) ?? null,
    status: row.status as HomeworkSession['status'],
  };
}
