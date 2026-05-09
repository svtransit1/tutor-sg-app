export type Subject = 'math' | 'english' | 'science' | 'chinese';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type SessionEventType =
  | 'question_attempted'
  | 'hint_shown'
  | 'answer_given'
  | 'struggle_detected'
  | 'help_requested'
  | 'solution_shown'
  | 'confidence_rating'
  | 'flag_raised'
  | 'session_ended';

export type MasteryLevel =
  | 'not_started'
  | 'beginner'
  | 'developing'
  | 'proficient'
  | 'mastered';

export interface KidSessionRow {
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
  updatedAt: string;
}

export interface SessionEventRow {
  id: number;
  sessionId: number;
  eventType: SessionEventType;
  payload: string | null;
  createdAt: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface KidProfileRow {
  id: number;
  name: string;
  level: number;
  avatarEmoji: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentPinRow {
  id: number;
  pinHash: string;
  failedAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SUBJECTS: readonly Subject[] = [
  'math', 'english', 'science', 'chinese',
] as const;

export const SESSION_EVENT_TYPES: readonly SessionEventType[] = [
  'question_attempted', 'hint_shown', 'answer_given',
  'struggle_detected', 'help_requested', 'solution_shown',
  'confidence_rating', 'flag_raised', 'session_ended',
] as const;

export const MASTERY_LEVELS: readonly MasteryLevel[] = [
  'not_started', 'beginner', 'developing', 'proficient', 'mastered',
] as const;
