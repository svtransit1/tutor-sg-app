/**
 * Session model for homework session persistence.
 *
 * Covers:
 * - Session metadata (subject, level, timing)
 * - Questions (OCR text, hints, steps, solution, kid answer)
 * - Kid interactions (follow-up text/voice/answer)
 * - AI-generated parent-facing summary
 * - Parent flagging
 *
 * Privacy invariant: photo_paths are local filesystem paths only.
 * No photo data or OCR text ever leaves the device (ADD §4.2).
 */

// ── Enums ─────────────────────────────────────────────────────────

export type Subject = 'english' | 'math' | 'science' | 'chinese_mt';
export type SessionStatus = 'active' | 'completed' | 'flagged';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export type InteractionType =
  | 'text'
  | 'voice'
  | 'answer'
  | 'hint_request'
  | 'solution_request';

// ── Core session ──────────────────────────────────────────────────

export interface HomeworkSession {
  /** UUID v4. */
  id: string;
  /** Profile ID of the kid (local-only, set during onboarding). */
  kidProfileId: string;

  // ── Metadata ──
  subject: Subject;
  topic?: string;
  level: Level;
  status: SessionStatus;

  // ── Timing ──
  /** ISO 8601 — session start. */
  startedAt: string;
  /** ISO 8601 — session end (null while active). */
  endedAt?: string;
  /** Computed at session end. */
  durationSeconds?: number;

  // ── Content (local paths only) ──
  /** Local filesystem paths to captured photos. Never contains remote URLs. */
  photoPaths: string[];

  /** Detected/answered questions. */
  questions: Question[];

  /** Kid follow-up interactions in this session. */
  kidInteractions: Interaction[];

  // ── AI summary (parent-facing) ──
  /** AI-generated summary of the session (on-device, never leaves device). */
  aiSummary?: string;

  // ── Parent review ──
  parentFlagged: boolean;
  parentNote?: string;
  parentFlaggedAt?: string;

  // ── Meta ──
  createdAt: string;
  updatedAt: string;
}

// ── Sub-structures ────────────────────────────────────────────────

export interface Question {
  /** UUID v4. */
  id: string;
  /** 0-based position in the session. */
  index: number;
  /** OCR-recognised text (handwritten + printed). */
  ocrText: string;
  /** OCR confidence 0–1. */
  ocrConfidence: number;
  /** True if kid typed/wrote the question manually instead of OCR. */
  manualInput?: boolean;
  /** Scaffolded hints shown to the kid, in order. */
  hintsGiven: string[];
  /** Guided steps revealed, in order. */
  stepsRevealed: string[];
  /** Whether the kid asked for the full answer. */
  solutionRevealed: boolean;
  /** The full solution text. */
  solution?: string;
  /** Kid's own answer (stylus text input). */
  kidAnswer?: string;
  /** AI detected the kid was struggling. */
  struggled: boolean;
  /** AI judgement of correctness. */
  correct?: boolean;
}

export interface Interaction {
  /** UUID v4. */
  id: string;
  type: InteractionType;
  /** The text/transcript content. */
  content: string;
  /** ISO 8601. */
  timestamp: string;
}

// ── DB row shape (internal — matches SQLite columns) ──────────────

export interface SessionRow {
  id: string;
  kid_profile_id: string;
  subject: string;
  topic: string | null;
  level: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  photo_paths: string;
  questions: string;
  kid_interactions: string;
  ai_summary: string | null;
  parent_flagged: number;
  parent_note: string | null;
  parent_flagged_at: string | null;
  created_at: string;
  updated_at: string;
}
