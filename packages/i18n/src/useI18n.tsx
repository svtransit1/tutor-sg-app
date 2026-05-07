import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useTranslation as useReactI18nextTranslation } from 'react-i18next';
import type { FallbackNs } from 'react-i18next';
import i18n from './config';
import type {
  TranslationKey,
  SupportedLocale,
  TranslationInterpolationMap,
  InterpolationParams,
} from './types';

// ---------------------------------------------------------------------------
// I18n context — provides locale + setLocale alongside the typed t()
// ---------------------------------------------------------------------------

export interface I18nContextValue {
  /** Current active locale */
  locale: SupportedLocale;
  /** Switch locale at runtime */
  setLocale: (locale: SupportedLocale) => void;
  /** Type-safe translation function */
  t: <K extends TranslationKey>(
    key: K,
    params?: InterpolationParams<K>,
  ) => string;
  /** Whether i18n is initialized */
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider — wraps the app so useI18n() works everywhere
// ---------------------------------------------------------------------------

export interface TutorSGProviderProps {
  children: React.ReactNode;
  /** Override the initial locale (for testing or forced locale) */
  locale?: SupportedLocale;
}

/**
 * Provider component for Tutor SG i18n.
 * Gives all descendants access to useI18n().
 */
export function TutorSGProvider({ children }: TutorSGProviderProps) {
  const {
    t: rawT,
    i18n: i18nInstance,
    ready,
  } = useReactI18nextTranslation<string, FallbackNs<typeof i18n>>();

  const locale = (i18nInstance.language as SupportedLocale) ?? 'en';

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      void i18nInstance.changeLanguage(newLocale);
    },
    [i18nInstance],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: rawT as I18nContextValue['t'],
      ready,
    }),
    [locale, setLocale, rawT, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Type-safe translation hook for Tutor SG.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const { t, locale, setLocale } = useI18n();
 *   return (
 *     <Button title={t('common.save')} />
 *   );
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error(
      'useI18n() must be used within a <TutorSGProvider>. ' +
        'Wrap your app root with <TutorSGProvider> after calling initializeI18n().',
    );
  }
  return ctx;
}
