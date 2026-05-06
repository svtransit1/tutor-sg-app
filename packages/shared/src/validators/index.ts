/**
 * Zod validators for shared domain types.
 *
 * Used by the mobile app and packages for runtime validation
 * of API responses, local storage, and cross-package boundaries.
 *
 * @packageDocumentation
 * @module @tutor-sg/shared/validators
 */

import { z } from 'zod';

// ── Primary level ─────────────────────────────────────────────────

export const PrimaryLevelSchema = z.enum([
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
]);

// ── Subject ───────────────────────────────────────────────────────

export const SubjectSchema = z.enum([
  'math',
  'english',
  'chinese_mt',
  'science',
]);

// ── Kid profile ───────────────────────────────────────────────────

export const KidProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  level: PrimaryLevelSchema,
  preferredLanguage: z.enum(['en', 'zh-Hans']),
  createdAt: z.string().datetime(),
});

// ── Session ───────────────────────────────────────────────────────

export const SessionSchema = z.object({
  id: z.string().uuid(),
  kidProfileId: z.string().uuid(),
  subject: SubjectSchema,
  topicIds: z.array(z.string().min(1)).min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  questionCount: z.number().int().min(0),
});

// Inferred types are available via z.infer<typeof PrimaryLevelSchema>
// Canonical PrimaryLevel and Subject types live in @tutor-sg/shared/types
