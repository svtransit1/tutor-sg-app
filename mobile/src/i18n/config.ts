import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-Hans': { translation: zhHans },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
