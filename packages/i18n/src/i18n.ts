export type Locale = 'en' | 'zh-Hans'
export const SUPPORTED_LOCALES: Locale[] = ['en', 'zh-Hans']
export const LOCALE_LABELS: Record<Locale, { en: string; native: string }> = {
  en: { en: 'English', native: 'English' },
  'zh-Hans': { en: 'Simplified Chinese', native: '简体中文' },
}
export async function initI18n(): Promise<void> {}
export function getLocale(): Locale {
  return 'en'
}
export function getLocales(): Locale[] {
  return SUPPORTED_LOCALES
}
export async function changeLanguage(locale: Locale): Promise<void> {}
export function setLocaleOverride(locale: Locale): void {}
export const i18n = { language: 'en' }
