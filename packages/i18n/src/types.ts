/**
 * Type-safe translation key definitions for Tutor SG.
 *
 * ## Usage
 *
 * The default namespace is `common`, so common keys can be used without prefix:
 * ```ts
 * t('save');         // ✅ common:save — no prefix needed
 * t('app.name');     // ✅ common:app.name — dots are literal (keySeparator: false)
 * ```
 *
 * Other namespaces require the `ns:` prefix or the `{ ns }` option:
 * ```ts
 * t('onboarding:welcome_title');   // ✅ ns prefix via ":"
 * t('welcome_title', { ns: 'onboarding' });  // ✅ equivalent
 * t('parent:pin_title');           // ✅ parent namespace
 * ```
 */

// Import namespace files as const types for inference
import commonEn from './locales/en/common.json';
import onboardingEn from './locales/en/onboarding.json';
import homeworkEn from './locales/en/homework.json';
import parentEn from './locales/en/parent.json';
import settingsEn from './locales/en/settings.json';

import commonZhHans from './locales/zh-Hans/common.json';
import onboardingZhHans from './locales/zh-Hans/onboarding.json';
import homeworkZhHans from './locales/zh-Hans/homework.json';
import parentZhHans from './locales/zh-Hans/parent.json';
import settingsZhHans from './locales/zh-Hans/settings.json';

// ---------------------------------------------------------------------------
// Namespace definitions
// ---------------------------------------------------------------------------

export const NAMESPACES = ['common', 'onboarding', 'homework', 'parent', 'settings'] as const;
export type I18nNamespace = (typeof NAMESPACES)[number];
export const DEFAULT_NS: I18nNamespace = 'common';

// ---------------------------------------------------------------------------
// Per-namespace key types
// ---------------------------------------------------------------------------

/** Type-safe keys within each namespace */
export type CommonKey = keyof typeof commonEn;
export type OnboardingKey = keyof typeof onboardingEn;
export type HomeworkKey = keyof typeof homeworkEn;
export type ParentKey = keyof typeof parentEn;
export type SettingsKey = keyof typeof settingsEn;

/**
 * Guard: verify at build time that all locale files have identical keys
 * across EN and zh-Hans for every namespace.
 * If any locale is missing a key, these type checks will fail.
 */
type _assertSameKeys<T, U> = [keyof T, keyof U] extends [keyof U, keyof T]
  ? true
  : { mismatch: true; missingInSecond: Exclude<keyof T, keyof U>; missingInFirst: Exclude<keyof U, keyof T> };

// Each line errors at compile time if the two locale files diverge
type _commonConsistency = _assertSameKeys<typeof commonEn, typeof commonZhHans>;
type _onboardingConsistency = _assertSameKeys<typeof onboardingEn, typeof onboardingZhHans>;
type _homeworkConsistency = _assertSameKeys<typeof homeworkEn, typeof homeworkZhHans>;
type _parentConsistency = _assertSameKeys<typeof parentEn, typeof parentZhHans>;
type _settingsConsistency = _assertSameKeys<typeof settingsEn, typeof settingsZhHans>;

// ---------------------------------------------------------------------------
// Translation key — the full set of keys that can be passed to t()
// ---------------------------------------------------------------------------

/**
 * All valid translation keys.
 *
 * Common keys can be used directly (e.g. `t('save')`).
 * Other namespace keys require the ns: prefix (e.g. `t('onboarding:welcome_title')`).
 */
export type TranslationKey =
  | CommonKey
  | `common:${CommonKey}`
  | `onboarding:${OnboardingKey}`
  | `homework:${HomeworkKey}`
  | `parent:${ParentKey}`
  | `settings:${SettingsKey}`;

/** Supported locales */
export type SupportedLocale = 'en' | 'zh-Hans';

// ---------------------------------------------------------------------------
// Interpolation types
// ---------------------------------------------------------------------------

/**
 * i18next interpolation values for keys that use {{variables}}.
 * Add entries here as you introduce new interpolated strings.
 * Keys are in `ns:key` format.
 */
export type TranslationInterpolationMap = {
  'onboarding:download_progress': { percent: string };
  'onboarding:download_cellular_desc': { size: string };
  'onboarding:download_retrying': { attempt: string | number; max: string | number };
  'parent:pin_wrong': { attempts: string };
  'parent:digit_filled': { position: string };
  'parent:digit_empty': { position: string };
  'parent:digit_confirm': { position: string };
  'parent:attempts_remaining': { count: string };
  'parent:cooldown_timer': { seconds: string };
  'parent:keypad_digit': { value: string };
  'settings:subscription_free_tier_desc': { photos: string; questions: string };
  'homework:worksheet_score': { correct: string | number; total: string | number };
};

/**
 * Helper: interpolation params for a given key, or undefined if none.
 */
export type InterpolationParams<K extends TranslationKey> =
  K extends keyof TranslationInterpolationMap
    ? TranslationInterpolationMap[K]
    : undefined;
