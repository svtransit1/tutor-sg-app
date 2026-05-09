import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
};

function getDeviceLocale(): string {
  const locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  if (locale.startsWith('zh')) return 'zh-Hans';
  return 'en';
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: getDeviceLocale(),
  fallbackLng: 'en',
  keySeparator: ".",
  interpolation: { escapeValue: false },
});

export default i18n;
