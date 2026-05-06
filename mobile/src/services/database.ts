/**
 * Database service — SQLite schema initialization + session CRUD.
 *
 * Architecture (ADD §7, Architecture §4):
 * - SQLite with expo-sqlite as the on-device database engine.
 * - Session data persists for the Parent Log (ADD §4.2).
 * - All child data (photos, OCR text, free-text) stays on-device.
 * - JSON columns for nested question/interaction arrays.
 *
 * The service follows an interface/impl pattern mirroring the
 * telemetry service (telemetry.ts) — production uses SQLite,
 * tests use the in-memory implementation.
 */

import type {
  HomeworkSession,
  SessionRow,
  Subject,
  SessionStatus,
  Level,
} from '@tutor-sg/shared';

// ── Schema DDL ────────────────────────────────────────────────────

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  kid_profile_id TEXT NOT NULL,

  -- Session metadata
  subject TEXT NOT NULL CHECK(subject IN ('english','math','science','chinese_mt')),
  topic TEXT,
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','flagged')),

  -- Timing
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER,

  -- Content (local paths only — JSON arrays)
  photo_paths TEXT NOT NULL DEFAULT '[]',
  questions TEXT NOT NULL DEFAULT '[]',
  kid_interactions TEXT NOT NULL DEFAULT '[]',

  -- AI summary (parent-facing)
  ai_summary TEXT,

  -- Parent review
  parent_flagged INTEGER NOT NULL DEFAULT 0 CHECK(parent_flagged IN (0,1)),
  parent_note TEXT,
  parent_flagged_at TEXT,

  -- Meta
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_kid_profile ON sessions(kid_profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
`;

// ── Session repository interface ──────────────────────────────────

export interface SessionRepository {
  /** Initialise the database (create tables, migrate if needed). */
  init(): Promise<void>;

  /** Insert a new session. */
  createSession(session: HomeworkSession): Promise<void>;

  /** Fetch a single session by ID, or null if not found. */
  getSession(id: string): Promise<HomeworkSession | null>;

  /** List sessions for a kid profile, newest first. */
  listSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<HomeworkSession[]>;

  /** Count sessions matching filters. */
  countSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<number>;

  /** Update specific fields of a session. */
  updateSession(
    id: string,
    updates: Partial<SessionUpdateFields>,
  ): Promise<void>;

  /** Flag a session for parent review. */
  flagSession(id: string, note?: string): Promise<void>;

  /** Hard-delete a session (admin/parent only). */
  deleteSession(id: string): Promise<void>;

  /** Close the database connection. */
  close(): Promise<void>;
}

export interface SessionListOptions {
  subject?: Subject;
  status?: SessionStatus;
  level?: Level;
  /** Return sessions started at or after this ISO timestamp. */
  fromDate?: string;
  /** Return sessions started at or before this ISO timestamp. */
  toDate?: string;
  limit?: number;
  offset?: number;
}

export type SessionUpdateFields = Pick<
  HomeworkSession,
  | 'status'
  | 'endedAt'
  | 'durationSeconds'
  | 'questions'
  | 'kidInteractions'
  | 'aiSummary'
  | 'photoPaths'
  | 'updatedAt'
>;

// ── Serialisation helpers ─────────────────────────────────────────

export function rowToSession(row: SessionRow): HomeworkSession {
  return {
    id: row.id,
    kidProfileId: row.kid_profile_id,
    subject: row.subject as Subject,
    topic: row.topic ?? undefined,
    level: row.level as Level,
    status: row.status as SessionStatus,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    photoPaths: JSON.parse(row.photo_paths),
    questions: JSON.parse(row.questions),
    kidInteractions: JSON.parse(row.kid_interactions),
    aiSummary: row.ai_summary ?? undefined,
    parentFlagged: row.parent_flagged === 1,
    parentNote: row.parent_note ?? undefined,
    parentFlaggedAt: row.parent_flagged_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sessionToRow(session: HomeworkSession): SessionRow {
  return {
    id: session.id,
    kid_profile_id: session.kidProfileId,
    subject: session.subject,
    topic: session.topic ?? null,
    level: session.level,
    status: session.status,
    started_at: session.startedAt,
    ended_at: session.endedAt ?? null,
    duration_seconds: session.durationSeconds ?? null,
    photo_paths: JSON.stringify(session.photoPaths),
    questions: JSON.stringify(session.questions),
    kid_interactions: JSON.stringify(session.kidInteractions),
    ai_summary: session.aiSummary ?? null,
    parent_flagged: session.parentFlagged ? 1 : 0,
    parent_note: session.parentNote ?? null,
    parent_flagged_at: session.parentFlaggedAt ?? null,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
}
