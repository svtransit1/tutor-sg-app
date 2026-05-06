import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh from './zh-Hans.json';
export { KID_LEVELS, MAX_KIDS, MAX_NAME_LENGTH, SUPPORTED_LOCALES } from '../constants';
export type { KidLevel, SupportedLocale } from '../constants';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    'zh-Hans': { translation: zh },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
