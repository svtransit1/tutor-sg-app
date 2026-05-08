import i18n, { type InitOptions, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales, getCalendars } from 'expo-localization';
import type { SupportedLocale } from './types';

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

export const NAMESPACES = ['common', 'onboarding', 'homework', 'parent', 'settings'] as const;
export type I18nNamespace = (typeof NAMESPACES)[number];
export const DEFAULT_NS: I18nNamespace = 'common';

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

export function detectDeviceLocale(): SupportedLocale {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const primary = locales[0];
      if (primary) {
        const langTag = primary.languageTag?.toLowerCase() ?? '';
        if (
          langTag.startsWith('zh') &&
          !langTag.startsWith('zh-tw') &&
          !langTag.startsWith('zh-hk') &&
          !langTag.startsWith('zh-mo')
        ) {
          return 'zh-Hans';
        }
        return 'en';
      }
    }
  } catch {
  }
  return 'en';
}

export function detectIsGregorianCalendar(): boolean {
  try {
    const calendars = getCalendars();
    if (calendars && calendars.length > 0) {
      return (calendars[0]?.calendar ?? 'gregory') === 'gregory';
    }
  } catch {
  }
  return true;
}

export type I18nConfig = {
  locale?: SupportedLocale;
  debug?: boolean;
};

export async function initializeI18n(config: I18nConfig = {}): Promise<typeof i18n> {
  const detectedLocale = config.locale ?? detectDeviceLocale();

  const i18nOptions: InitOptions = {
    keySeparator: false,
    nsSeparator: ':',
    defaultNS: DEFAULT_NS,
    ns: [...NAMESPACES],
    lng: detectedLocale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-Hans'],
    resources: buildResources(),
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: config.debug ?? __DEV__,
    returnNull: false,
    returnEmptyString: true,
    parseMissingKeyHandler:
      __DEV__
        ? (key: string) => {
            console.warn(`[tutor-sg/i18n] Missing translation key: "${key}"`);
            return key;
          }
        : undefined,
  };

  i18n.use(initReactI18next);

  if (!i18n.isInitialized) {
    await i18n.init(i18nOptions);
  }

  return i18n;
}

export function setLocale(locale: SupportedLocale): void {
  if (i18n.isInitialized) {
    i18n.changeLanguage(locale);
  }
}

export default i18n;
