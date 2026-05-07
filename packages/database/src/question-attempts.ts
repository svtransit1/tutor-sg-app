import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { QuestionAttempt, Subject } from './types';

export function addQuestionAttempt(
  db: DatabaseExecutor,
  params: {
    sessionLogId: string;
    questionText: string;
    subject: Subject;
    topic?: string;
  },
): QuestionAttempt {
  const now = new Date().toISOString();
  const id = uuid();
  db.run(
    `INSERT INTO question_attempt (id, session_log_id, question_text, subject, topic, hints_used, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [id, params.sessionLogId, params.questionText, params.subject, params.topic ?? '', now],
  );
  return getQuestionAttempt(db, id)!;
}

export function getQuestionAttempt(
  db: DatabaseExecutor,
  id: string,
): QuestionAttempt | null {
  const row = db.getFirst<{
    id: string;
    session_log_id: string;
    question_text: string;
    subject: string;
    topic: string;
    answer: string | null;
    correct: number | null;
    hints_used: number;
    created_at: string;
  }>('SELECT * FROM question_attempt WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    sessionLogId: row.session_log_id,
    questionText: row.question_text,
    subject: row.subject as Subject,
    topic: row.topic,
    answer: row.answer,
    correct: row.correct === null ? null : row.correct === 1,
    hintsUsed: row.hints_used,
    createdAt: row.created_at,
  };
}

export function updateQuestionAttemptAnswer(
  db: DatabaseExecutor,
  id: string,
  params: { answer: string; correct: boolean },
): QuestionAttempt | null {
  db.run(
    'UPDATE question_attempt SET answer = ?, correct = ? WHERE id = ?',
    [params.answer, params.correct ? 1 : 0, id],
  );
  return getQuestionAttempt(db, id);
}

export function incrementHintsUsed(
  db: DatabaseExecutor,
  id: string,
): QuestionAttempt | null {
  db.run(
    'UPDATE question_attempt SET hints_used = hints_used + 1 WHERE id = ?',
    [id],
  );
  return getQuestionAttempt(db, id);
}

export function listQuestionAttempts(
  db: DatabaseExecutor,
  sessionLogId: string,
): QuestionAttempt[] {
  const rows = db.getAll<{
    id: string;
    session_log_id: string;
    question_text: string;
    subject: string;
    topic: string;
    answer: string | null;
    correct: number | null;
    hints_used: number;
    created_at: string;
  }>(
    'SELECT * FROM question_attempt WHERE session_log_id = ? ORDER BY created_at ASC',
    [sessionLogId],
  );

  return rows.map((row) => ({
    id: row.id,
    sessionLogId: row.session_log_id,
    questionText: row.question_text,
    subject: row.subject as Subject,
    topic: row.topic,
    answer: row.answer,
    correct: row.correct === null ? null : row.correct === 1,
    hintsUsed: row.hints_used,
    createdAt: row.created_at,
  }));
}
