import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
  'zh-Hans-SG': { translation: zhHans },
} as const;

/**
 * Detect the device language and return the best matching i18n locale tag.
 * - Pure zh-* variants → zh-Hans
 * - Everything else → en
 */
export function detectLocale(): string {
  const locales = Localization.getLocales();
  const preferred = locales[0]?.languageTag;
  if (!preferred) return 'en';
  if (preferred.startsWith('zh')) return 'zh-Hans';
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLocale(),
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    keySeparator: false,
    compatibilityJSON: 'v4',
    returnObjects: false,
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
