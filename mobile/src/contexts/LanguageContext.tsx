import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Locale = 'en' | 'zh-Hans';

interface LanguageContextValue {
  language: Locale;
  isChinese: boolean;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  const language = (i18n.language === 'zh-Hans' ? 'zh-Hans' : 'en') as Locale;
  const isChinese = language === 'zh-Hans';

  const setLanguage = useCallback(
    (lang: Locale) => {
      i18n.changeLanguage(lang);
    },
    [i18n],
  );

  const toggleLanguage = useCallback(() => {
    const next: Locale = language === 'zh-Hans' ? 'en' : 'zh-Hans';
    i18n.changeLanguage(next);
  }, [i18n, language]);

  const value = useMemo(
    () => ({ language, isChinese, setLanguage, toggleLanguage }),
    [language, isChinese, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
