import type { ParentSession, QuestionAttempt } from '../storage/parentSessions';

export function generateSessionSummary(session: ParentSession, attempts: QuestionAttempt[]): string {
  const struggleCount = attempts.filter(a => a.struggleDetected).length;
  const correctCount = attempts.filter(a => a.correct).length;
  const hintsUsedCount = attempts.reduce((sum, a) => sum + a.hintsUsed, 0);
  const parts: string[] = [];

  if (attempts.length === 0) {
    parts.push(`${session.subject} session started — no questions attempted.`);
  } else {
    parts.push(`${session.subject} — ${correctCount}/${attempts.length} correct.`);
    if (struggleCount > 0) parts.push(`${struggleCount} question(s) needed extra help.`);
    if (hintsUsedCount > 0) parts.push(`${hintsUsedCount} hint(s) used.`);
  }

  return parts.join(' ');
}
