import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { UsageCounter } from './types';

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getOrCreateUsageCounter(
  db: DatabaseExecutor,
  kidProfileId: string,
  date?: string,
): UsageCounter {
  const dateStr = date ?? todayDate();
  const existing = db.getFirst<{
    id: string;
    kid_profile_id: string;
    date: string;
    photo_count: number;
    question_count: number;
  }>(
    'SELECT * FROM usage_counter WHERE kid_profile_id = ? AND date = ?',
    [kidProfileId, dateStr],
  );

  if (existing) {
    return {
      id: existing.id,
      kidProfileId: existing.kid_profile_id,
      date: existing.date,
      photoCount: existing.photo_count,
      questionCount: existing.question_count,
    };
  }

  const id = uuid();
  db.run(
    'INSERT INTO usage_counter (id, kid_profile_id, date, photo_count, question_count) VALUES (?, ?, ?, 0, 0)',
    [id, kidProfileId, dateStr],
  );

  return {
    id,
    kidProfileId,
    date: dateStr,
    photoCount: 0,
    questionCount: 0,
  };
}

export function incrementPhotoCount(
  db: DatabaseExecutor,
  kidProfileId: string,
  date?: string,
): UsageCounter {
  const counter = getOrCreateUsageCounter(db, kidProfileId, date);
  db.run(
    'UPDATE usage_counter SET photo_count = photo_count + 1 WHERE id = ?',
    [counter.id],
  );
  return getOrCreateUsageCounter(db, kidProfileId, date);
}

export function incrementQuestionCount(
  db: DatabaseExecutor,
  kidProfileId: string,
  date?: string,
): UsageCounter {
  const counter = getOrCreateUsageCounter(db, kidProfileId, date);
  db.run(
    'UPDATE usage_counter SET question_count = question_count + 1 WHERE id = ?',
    [counter.id],
  );
  return getOrCreateUsageCounter(db, kidProfileId, date);
}

export function getUsageForDate(
  db: DatabaseExecutor,
  kidProfileId: string,
  date?: string,
): UsageCounter {
  return getOrCreateUsageCounter(db, kidProfileId, date);
}

export function getUsageForDateRange(
  db: DatabaseExecutor,
  kidProfileId: string,
  startDate: string,
  endDate: string,
): UsageCounter[] {
  const rows = db.getAll<{
    id: string;
    kid_profile_id: string;
    date: string;
    photo_count: number;
    question_count: number;
  }>(
    'SELECT * FROM usage_counter WHERE kid_profile_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
    [kidProfileId, startDate, endDate],
  );

  return rows.map((row) => ({
    id: row.id,
    kidProfileId: row.kid_profile_id,
    date: row.date,
    photoCount: row.photo_count,
    questionCount: row.question_count,
  }));
}
