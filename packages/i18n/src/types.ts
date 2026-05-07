/**
 * Type-safe translation key definitions for Tutor SG.
 *
 * Usage:
 *   import { useI18n } from '@tutor-sg/i18n';
 *   const { t } = useI18n();
 *   t('app.name');         // ✅ typed
 *   t('nonexistent.key');  // ❌ type error
 */

// Import the flat JSON as a const type so we can infer exact keys
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

/**
 * The set of all translation keys shared across both locales.
 * Both locale files must have exactly the same keys.
 */
export type TranslationKey = keyof typeof en;

/**
 * Guard: verify at build time that both locale files have identical keys.
 * If one locale is missing a key, this line will produce a type error.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _assertSameKeys<T, U> = [keyof T, keyof U] extends [keyof U, keyof T]
  ? true
  : { message: 'Locale key mismatch between en.json and zh-Hans.json'; missingInZhHans: Exclude<keyof T, keyof U>; missingInEn: Exclude<keyof U, keyof T> };

// This is evaluated at compile time — if it errors, the locale files are out of sync.
type _localeConsistencyCheck = _assertSameKeys<typeof en, typeof zhHans>;

/** Supported locales */
export type SupportedLocale = 'en' | 'zh-Hans';

/**
 * i18next interpolation values for keys that use {{variables}}.
 * Add entries here as you introduce new interpolated strings.
 */
export type TranslationInterpolationMap = {
  'onboarding.download_progress': { percent: string };
  'onboarding.download_cellular_desc': { size: string };
  'onboarding.download_retrying': { attempt: string | number; max: string | number };
  'parent.pin_wrong': { attempts: string };
  'subscription.free_tier_desc': { photos: string; questions: string };
  'worksheet.score': { correct: string | number; total: string | number };
};

/**
 * Helper: interpolation params for a given key, or undefined if none.
 */
export type InterpolationParams<K extends TranslationKey> =
  K extends keyof TranslationInterpolationMap
    ? TranslationInterpolationMap[K]
    : undefined;
