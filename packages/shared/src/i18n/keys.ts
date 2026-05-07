/**
 * Typed i18n key registry for tutor-sg.
 *
 * Every key in this type MUST have a corresponding entry in both
 * `mobile/src/i18n/locales/en.json` and `zh-Hans.json`.
 *
 * @packageDocumentation
 * @module @tutor-sg/shared/i18n
 */

// ── Top-level keys ───────────────────────────────────────────────

export type I18nKey =
  | 'app.loading'
  | 'app.name'
  | 'onboarding.welcome.title'
  | 'onboarding.welcome.subtitle'
  | 'onboarding.done.title'
  | 'onboarding.done.subtitle'
  // ── Network status ─────────────────────────────────────
  | 'network.offline'
  | 'network.offline.description'
  | 'network.cellular'
  | 'network.cellular.description'
  // ── Parent auth ──────────────────────────────────────────
  | `parentAuth.${ParentAuthKey}`
  // ── Parent dashboard ─────────────────────────────────────
  | `parent.${ParentAreaKey}`
  // ── Model download ───────────────────────────────────────
  | `modelDownload.${ModelDownloadKey}`;

// ── Sub-key spaces ────────────────────────────────────────────────

export type ParentAuthKey =
  | 'title'
  | 'enterPin'
  | 'wrongPin'
  | 'cooldown'
  | 'cooldownTimer'
  | 'attemptsRemaining'
  | 'attemptsRemaining_plural'
  | 'pinsDontMatch'
  | `setup.${ParentAuthSetupKey}`;

export type ParentAuthSetupKey = 'title' | 'enterPin' | 'confirmPin';

export type ParentAreaKey =
  | `dashboard.${ParentDashboardKey}`
  | `settings.${ParentSettingsKey}`;

export type ParentDashboardKey = 'title' | 'placeholder';

export type ParentSettingsKey =
  | 'title'
  | 'sectionQuality'
  | 'qualityDescription'
  | 'qualityAuto'
  | 'qualityHigh'
  | 'qualityStandard'
  | 'qualityLow'
  | 'tierAuto'
  | 'tierOverride'
  | 'modelInfo'
  | 'sectionLanguage'
  | 'languageDescription'
  | 'languageEn'
  | 'languageZh'
  | 'footerInfo';

export type ModelDownloadKey =
  | 'title'
  | 'progress'
  | 'progressPercent'
  | 'retrying'
  | 'paused'
  | 'resuming'
  | 'completed'
  | 'retry'
  | 'wifiRequired'
  | `errors.${ModelDownloadErrorKey}`;

export type ModelDownloadErrorKey =
  | 'connectivity_lost'
  | 'disk_insufficient'
  | 'cdn_unreachable'
  | 'hash_mismatch'
  | 'download_stuck'
  | 'unknown_error';

// ── Runtime key safety ────────────────────────────────────────────

/**
 * All known i18n keys as a flat string array.
 * Use with `i18next.options.keySeparator = false`.
 */
export const I18N_KEYS = [
  'app.loading',
  'app.name',
  'onboarding.welcome.title',
  'onboarding.welcome.subtitle',
  'onboarding.done.title',
  'onboarding.done.subtitle',
  'network.offline',
  'network.offline.description',
  'network.cellular',
  'network.cellular.description',
  'parentAuth.title',
  'parentAuth.enterPin',
  'parentAuth.wrongPin',
  'parentAuth.cooldown',
  'parentAuth.cooldownTimer',
  'parentAuth.attemptsRemaining',
  'parentAuth.attemptsRemaining_plural',
  'parentAuth.pinsDontMatch',
  'parentAuth.setup.title',
  'parentAuth.setup.enterPin',
  'parentAuth.setup.confirmPin',
  'parent.dashboard.title',
  'parent.dashboard.placeholder',
  'parent.settings.title',
  'parent.settings.sectionQuality',
  'parent.settings.qualityDescription',
  'parent.settings.qualityAuto',
  'parent.settings.qualityHigh',
  'parent.settings.qualityStandard',
  'parent.settings.qualityLow',
  'parent.settings.tierAuto',
  'parent.settings.tierOverride',
  'parent.settings.modelInfo',
  'parent.settings.sectionLanguage',
  'parent.settings.languageDescription',
  'parent.settings.languageEn',
  'parent.settings.languageZh',
  'parent.settings.footerInfo',
  'modelDownload.title',
  'modelDownload.progress',
  'modelDownload.progressPercent',
  'modelDownload.retrying',
  'modelDownload.paused',
  'modelDownload.resuming',
  'modelDownload.completed',
  'modelDownload.retry',
  'modelDownload.wifiRequired',
  'modelDownload.errors.connectivity_lost',
  'modelDownload.errors.disk_insufficient',
  'modelDownload.errors.cdn_unreachable',
  'modelDownload.errors.hash_mismatch',
  'modelDownload.errors.download_stuck',
  'modelDownload.errors.unknown_error',
] as const;

/** Union of all valid i18n keys. */
export type I18nKeyLiteral = (typeof I18N_KEYS)[number];

// ── Locale descriptor ─────────────────────────────────────────────

/** Supported locale codes. */
export type Locale = 'en' | 'zh-Hans';

/** Locale metadata. */
export interface LocaleDescriptor {
  code: Locale;
  labelEn: string;
  labelNative: string;
}

/** All supported locales with display labels. */
export const LOCALES: LocaleDescriptor[] = [
  { code: 'en', labelEn: 'English', labelNative: 'English' },
  { code: 'zh-Hans', labelEn: 'Simplified Chinese', labelNative: '简体中文' },
];
