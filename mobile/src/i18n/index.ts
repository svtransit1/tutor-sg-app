import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './en.json';
import zh from './zh-Hans.json';

export const SUPPORTED_LOCALES = ['en', 'zh-Hans'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const KID_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
export type KidLevel = (typeof KID_LEVELS)[number];

export const MAX_KIDS = 4;
export const MAX_NAME_LENGTH = 30;

const locales = getLocales();
const deviceLang = locales[0]?.languageCode ?? 'en';
const initialLang = deviceLang === 'zh' ? 'zh-Hans' : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    'zh-Hans': { translation: zh },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
