import i18n, { type InitOptions, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales, getCalendars } from 'expo-localization';
import type { SupportedLocale } from './types';

// Namespace resource imports
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

/**
 * Namespace definitions for Tutor SG.
 * Organise keys by product domain for maintainability.
 *
 * | Namespace     | Scope                                    |
 * |---------------|------------------------------------------|
 * | common        | App metadata, shared UI, subjects, errors |
 * | onboarding    | First-launch flow (model download, setup) |
 * | homework      | Camera, chat, worksheets                  |
 * | parent        | Parent dashboard, PIN gate, session log   |
 * | settings      | Preferences, IAP, subscription            |
 */
export const NAMESPACES = ['common', 'onboarding', 'homework', 'parent', 'settings'] as const;
export type I18nNamespace = (typeof NAMESPACES)[number];

export const DEFAULT_NS: I18nNamespace = 'common';

/**
 * Build the resource bundle for i18next from per-namespace JSON files.
 */
function buildResources(): Resource {
  return {
    en: {
      common: commonEn,
      onboarding: onboardingEn,
      homework: homeworkEn,
      parent: parentEn,
      settings: settingsEn,
    },
    'zh-Hans': {
      common: commonZhHans,
      onboarding: onboardingZhHans,
      homework: homeworkZhHans,
      parent: parentZhHans,
      settings: settingsZhHans,
    },
  };
}

/**
 * Detects the best matching locale from the device.
 * Returns 'en' or 'zh-Hans' based on the device's language settings.
 * Falls back to 'en' for any unsupported locale.
 */
export function detectDeviceLocale(): SupportedLocale {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const primary = locales[0];
      if (primary) {
        const langTag = primary.languageTag?.toLowerCase() ?? '';
        // Match Simplified Chinese variants (SG, CN, etc.)
        if (
          langTag.startsWith('zh') &&
          !langTag.startsWith('zh-tw') &&
          !langTag.startsWith('zh-hk') &&
          !langTag.startsWith('zh-mo')
        ) {
          return 'zh-Hans';
        }
        // English fallback for everything else
        return 'en';
      }
    }
  } catch {
    // expo-localization can throw on some simulator configs
  }
  return 'en';
}

/**
 * Detects whether the device uses a Gregorian calendar.
 * Not directly needed for i18n, but useful for date formatting decisions.
 */
export function detectIsGregorianCalendar(): boolean {
  try {
    const calendars = getCalendars();
    if (calendars && calendars.length > 0) {
      return (calendars[0]?.calendar ?? 'gregory') === 'gregory';
    }
  } catch {
    // fall through
  }
  return true;
}

export type I18nConfig = {
  /** Initial locale to use (default: device-detected) */
  locale?: SupportedLocale;

  /** Debug mode (default: __DEV__) */
  debug?: boolean;
};

/**
 * Creates and initializes the i18next instance for Tutor SG.
 * Must be called once during app startup (typically in App.tsx or root layout).
 *
 * @example
 * ```ts
 * import { initializeI18n } from '@tutor-sg/i18n';
 * await initializeI18n();
 * ```
 */
export async function initializeI18n(config: I18nConfig = {}): Promise<typeof i18n> {
  const detectedLocale = config.locale ?? detectDeviceLocale();

  const i18nOptions: InitOptions = {
    // Flat key structure — dots in keys are literal, not path separators
    keySeparator: false,

    // Namespace separator — enables t('ns:key') and t('key', { ns: 'ns' })
    nsSeparator: ':',
    // Default namespace so t('save') resolves to common:save
    defaultNS: DEFAULT_NS,
    // Declare all available namespaces
    ns: [...NAMESPACES],

    lng: detectedLocale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-Hans'],

    // Resource bundles — keyed by locale → namespace → flat keys
    resources: buildResources(),

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React integration
    react: {
      useSuspense: false,
    },

    // Debug in dev mode
    debug: config.debug ?? __DEV__,

    // Return null for missing keys (will show key path in dev if debug is on)
    returnNull: false,
    returnEmptyString: true,

    // Parse missing key handler for dev
    parseMissingKeyHandler: __DEV__
      ? (key: string) => {
          // eslint-disable-next-line no-undef
          console.warn(`[tutor-sg/i18n] Missing translation key: "${key}"`);
          return key;
        }
      : undefined,
  };

  // Initialize i18next with the React integration
  i18n.use(initReactI18next);

  // Initialize (safe to call multiple times — subsequent calls are no-ops)
  if (!i18n.isInitialized) {
    await i18n.init(i18nOptions);
  }

  return i18n;
}

/**
 * Convenience: change the active locale at runtime.
 * Persists the selection so it survives app restarts (caller should store in AsyncStorage/MMKV).
 */
export function setLocale(locale: SupportedLocale): void {
  if (i18n.isInitialized) {
    i18n.changeLanguage(locale);
  }
}

export default i18n;
