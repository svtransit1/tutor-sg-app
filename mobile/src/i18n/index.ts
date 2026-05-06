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

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageTag.startsWith('zh') ? 'zh-Hans' : 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  keySeparator: false,
  compatibilityJSON: 'v4',
});

export default i18n;
