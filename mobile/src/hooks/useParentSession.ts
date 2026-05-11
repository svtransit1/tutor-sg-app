import { useCallback } from 'react';
import { KidProfileRepository } from '../storage/kidProfiles';
import { ParentSessionRepository, ParentSubject } from '../storage/parentSessions';

export interface UseParentSessionReturn {
  startParentSession: (subject: ParentSubject, topic?: string) => Promise<string | null>;
  logQuestionAttempt: (
    questionId: string,
    correct: boolean,
    hintsUsed: number,
    timeSeconds: number,
    struggleDetected: boolean,
  ) => Promise<void>;
  endParentSession: (aiSummary: string, parentFlagged: boolean) => Promise<void>;
  activeSessionId: string | null;
}

let _activeSessionId: string | null = null;

export function useParentSession(): UseParentSessionReturn {
  const startParentSession = useCallback(
    async (subject: ParentSubject, topic = ''): Promise<string | null> => {
      try {
        const kid = await KidProfileRepository.getActiveKid();
        if (!kid) return null;
        const sessionId = await ParentSessionRepository.startSession(kid.id, subject, topic);
        _activeSessionId = sessionId;
        return sessionId;
      } catch {
        return null;
      }
    },
    [],
  );

  const logQuestionAttempt = useCallback(
    async (
      questionId: string,
      correct: boolean,
      hintsUsed: number,
      timeSeconds: number,
      struggleDetected: boolean,
    ): Promise<void> => {
      if (!_activeSessionId) return;
      try {
        await ParentSessionRepository.logQuestionAttempt(
          _activeSessionId,
          questionId,
          correct,
          hintsUsed,
          timeSeconds,
          struggleDetected,
        );
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const endParentSession = useCallback(
    async (aiSummary: string, parentFlagged: boolean): Promise<void> => {
      if (!_activeSessionId) return;
      try {
        await ParentSessionRepository.endSession(_activeSessionId, aiSummary, parentFlagged);
      } catch {
        /* ignore */
      } finally {
        _activeSessionId = null;
      }
    },
    [],
  );

  return {
    startParentSession,
    logQuestionAttempt,
    endParentSession,
    get activeSessionId() {
      return _activeSessionId;
    },
  };
}
