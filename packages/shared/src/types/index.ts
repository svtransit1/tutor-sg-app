/**
 * Core domain types for tutor-sg.
 *
 * @packageDocumentation
 * @module @tutor-sg/shared/types
 */

// ── User / Profile ───────────────────────────────────────────────

/** A child profile under a parent account. Stored locally, never synced. */
export interface KidProfile {
  /** Stable local UUID. */
  id: string;
  /** Display name chosen by parent or kid. */
  name: string;
  /** Primary level: P1–P6. */
  level: PrimaryLevel;
  /** ISO 639-1 + region subtag for session language preference. */
  preferredLanguage: 'en' | 'zh-Hans';
  /** UTC ISO timestamp of profile creation. */
  createdAt: string;
}

/** Singapore primary school level (P1–P6). */
export type PrimaryLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

/** Parent account metadata (local cache of Supabase auth record). */
export interface ParentAccount {
  /** Supabase user id. */
  id: string;
  /** Email used for sign-up. */
  email: string;
  /** Whether parent has opted in to anonymized telemetry. */
  telemetryOptIn: boolean;
}

// ── Subjects & Topics ────────────────────────────────────────────

/** The four core MOE subjects supported in v1. */
export type Subject = 'math' | 'english' | 'chinese_mt' | 'science';

/** A topic node in the MOE syllabus tree. */
export interface Topic {
  /** Stable topic id (e.g. `"p4_math_fractions"`). */
  id: string;
  /** Human-readable name in English. */
  nameEn: string;
  /** Human-readable name in Simplified Chinese. */
  nameZhHans: string;
  /** Parent subject. */
  subject: Subject;
  /** Primary level this topic is taught at. */
  level: PrimaryLevel;
  /** Sub-topic children (leaf nodes have empty array). */
  children: Topic[];
}

// ── Sessions & Worksheets ────────────────────────────────────────

/** One complete homework-help session. */
export interface Session {
  /** Session UUID. */
  id: string;
  /** Which kid profile ran this session. */
  kidProfileId: string;
  /** Subject the session covered. */
  subject: Subject;
  /** Topic ids detected / manually selected. */
  topicIds: string[];
  /** UTC start timestamp. */
  startedAt: string;
  /** UTC end timestamp. Null while session is live. */
  endedAt: string | null;
  /** Number of questions attempted. */
  questionCount: number;
}

/** One generated practice worksheet. */
export interface Worksheet {
  /** Worksheet UUID. */
  id: string;
  /** Subject + topic this worksheet covers. */
  subject: Subject;
  topicId: string;
  /** Kid level targeted. */
  level: PrimaryLevel;
  /** Ordered list of question items. */
  items: WorksheetItem[];
  /** UTC generation timestamp. */
  generatedAt: string;
}

/** A single question on a generated worksheet. */
export interface WorksheetItem {
  /** Stable item id within the worksheet. */
  id: string;
  /** The question prompt (localized). */
  prompt: string;
  /** Expected answer (for auto-marking). */
  expectedAnswer: string;
  /** Hint shown before revealing answer. */
  hint: string;
  /** Full worked solution. */
  solution: string;
  /** Difficulty within the topic (1–5). */
  difficulty: 1 | 2 | 3 | 4 | 5;
}
