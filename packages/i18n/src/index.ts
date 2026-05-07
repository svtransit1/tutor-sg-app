export type Locale = 'en' | 'zh-Hans'
const SUPPORTED_LOCALES: Locale[] = ['en', 'zh-Hans']

export function getLocale(): Locale {
  return 'en'
}

export function getLocales(): Locale[] {
  return SUPPORTED_LOCALES
}
