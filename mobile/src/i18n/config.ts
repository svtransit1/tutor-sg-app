/**
 * i18n configuration — init i18next with EN + zh-Hans JSON resources.
 *
 * Per platform contract: bilingual only (English + Simplified Chinese).
 * Per ADD §2: flat phrase-keyed JSON, keySeparator: false.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

// Detect device language — prefer zh-Hans for Chinese locales
function detectLanguage(): string {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const lang = locales[0].languageCode ?? 'en';
      if (lang === 'zh' || lang === 'zho') {
        const script = locales[0].scriptCode ?? '';
        if (script === 'Hans' || !script) return 'zh-Hans';
      }
    }
  } catch {
    // Fallback to 'en' on detection failure
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-Hans': { translation: zhHans },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false, // React already escapes
  },
  compatibilityJSON: 'v4',
});

export default i18n;
