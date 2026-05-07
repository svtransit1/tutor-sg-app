/**
 * @module telemetry/types
 *
 * Typed event definitions for opt-in telemetry.
 *
 * Per Onboarding Dev Spec §6 — all events are buffered locally in M2
 * and never sent. The schema exists now so instrumentation is correct
 * when the analytics sink is wired in M3+.
 *
 * All events are opt-in (default opt-out) per AC #9.
 */

import { z } from 'zod';

// ── Shared types ───────────────────────────────────────────────────

export const localeSchema = z.enum(['en', 'zh-Hans']);
export type Locale = z.infer<typeof localeSchema>;

export const gradeSchema = z.enum(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
export type Grade = z.infer<typeof gradeSchema>;

export const subjectSchema = z.enum(['math', 'english', 'chinese', 'science']);
export type Subject = z.infer<typeof subjectSchema>;

export const deviceTierSchema = z.enum(['high', 'low', 'unsupported']);
export type DeviceTierV2 = z.infer<typeof deviceTierSchema>;

// ── Individual event payloads ──────────────────────────────────────

/** Lang picked on the language selection screen. */
export const langPickedSchema = z.object({
  event: z.literal('onboarding_lang_picked'),
  timestamp: z.number(),
  lang: localeSchema,
});
export type LangPickedEvent = z.infer<typeof langPickedSchema>;

/** Grade selected during onboarding grade pick. */
export const gradePickedSchema = z.object({
  event: z.literal('onboarding_grade_picked'),
  timestamp: z.number(),
  grade: gradeSchema,
});
export type GradePickedEvent = z.infer<typeof gradePickedSchema>;

/** Subjects selected during onboarding subject pick. */
export const subjectsPickedSchema = z.object({
  event: z.literal('onboarding_subjects_picked'),
  timestamp: z.number(),
  subjects: z.array(subjectSchema).min(1),
});
export type SubjectsPickedEvent = z.infer<typeof subjectsPickedSchema>;

/** Sibling added (or skipped) during the sibling prompt. */
export const siblingAddedSchema = z.object({
  event: z.literal('onboarding_sibling_added'),
  timestamp: z.number(),
  count: z.number().int().min(0).max(4),
});
export type SiblingAddedEvent = z.infer<typeof siblingAddedSchema>;

/** Device tier sniff result. */
export const deviceTierEventSchema = z.object({
  event: z.literal('onboarding_device_tier'),
  timestamp: z.number(),
  tier: deviceTierSchema,
});
export type DeviceTierEvent = z.infer<typeof deviceTierEventSchema>;

/** Camera permission result. */
export const permCameraSchema = z.object({
  event: z.literal('onboarding_perm_camera'),
  timestamp: z.number(),
  granted: z.boolean(),
});
export type PermCameraEvent = z.infer<typeof permCameraSchema>;

/** Notification permission result. */
export const permNotifSchema = z.object({
  event: z.literal('onboarding_perm_notif'),
  timestamp: z.number(),
  granted: z.boolean(),
});
export type PermNotifEvent = z.infer<typeof permNotifSchema>;

/** Model download started. */
export const downloadStartedSchema = z.object({
  event: z.literal('onboarding_download_started'),
  timestamp: z.number(),
  tier: deviceTierSchema,
  bytes: z.number().int().positive(),
});
export type DownloadStartedEvent = z.infer<typeof downloadStartedSchema>;

/** Model download completed successfully. */
export const downloadCompletedSchema = z.object({
  event: z.literal('onboarding_download_completed'),
  timestamp: z.number(),
  durationSec: z.number().positive(),
  bytes: z.number().int().positive(),
  retries: z.number().int().min(0),
});
export type DownloadCompletedEvent = z.infer<typeof downloadCompletedSchema>;

/** Model download failed. */
export const downloadFailedSchema = z.object({
  event: z.literal('onboarding_download_failed'),
  timestamp: z.number(),
  reason: z.string().min(1),
});
export type DownloadFailedEvent = z.infer<typeof downloadFailedSchema>;

/** Onboarding flow fully completed (kid reaches READY_LANDING). */
export const onboardingCompletedSchema = z.object({
  event: z.literal('onboarding_completed'),
  timestamp: z.number(),
  totalDurationSec: z.number().positive(),
});
export type OnboardingCompletedEvent = z.infer<typeof onboardingCompletedSchema>;

/** Step viewed during onboarding navigation. */
export const stepViewedSchema = z.object({
  event: z.literal('onboarding_step_viewed'),
  timestamp: z.number(),
  step: z.string().min(1),
});
export type StepViewedEvent = z.infer<typeof stepViewedSchema>;

/** First time kid opens the camera after onboarding. */
export const firstCameraOpenSchema = z.object({
  event: z.literal('first_camera_open_after_onboarding'),
  timestamp: z.number(),
  latencySec: z.number().positive(),
});
export type FirstCameraOpenEvent = z.infer<typeof firstCameraOpenSchema>;

// ── Union type ─────────────────────────────────────────────────────

/**
 * Every onboarding telemetry event discriminated by event name.
 * Add new event schemas here as M2+ features land.
 */
export const telemetryEventSchema = z.discriminatedUnion('event', [
  langPickedSchema,
  gradePickedSchema,
  subjectsPickedSchema,
  siblingAddedSchema,
  deviceTierEventSchema,
  permCameraSchema,
  permNotifSchema,
  downloadStartedSchema,
  downloadCompletedSchema,
  downloadFailedSchema,
  onboardingCompletedSchema,
  firstCameraOpenSchema,
  stepViewedSchema,
]);

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

// ── Opt-in consent ─────────────────────────────────────────────────

/**
 * Telemetry consent preference.
 * Default: 'denied' — no events are stored or sent until parent consents.
 */
export const telemetryConsentSchema = z.enum(['granted', 'denied']);
export type TelemetryConsent = z.infer<typeof telemetryConsentSchema>;
