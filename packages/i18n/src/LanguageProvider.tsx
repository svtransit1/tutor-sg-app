import React, { createContext, useContext } from 'react'
import { getLocale, LOCALE_LABELS, type Locale } from './i18n'
const LanguageContext = createContext<{ locale: Locale; locales: typeof LOCALE_LABELS }>({
  locale: 'en',
  locales: LOCALE_LABELS,
})
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    LanguageContext.Provider,
    { value: { locale: getLocale(), locales: LOCALE_LABELS } },
    children,
  )
}
export function useLanguage() {
  return useContext(LanguageContext)
}
export function useLocale(): Locale {
  return useContext(LanguageContext).locale
}
export function useSupportedLocales() {
  return useContext(LanguageContext).locales
}
