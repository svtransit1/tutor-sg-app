export { initializeI18n, detectDeviceLocale, setLocale, detectIsGregorianCalendar } from './config';
export type { I18nConfig } from './config';

export { NAMESPACES, DEFAULT_NS } from './types';
export type { I18nNamespace } from './types';

export type {
  TranslationKey,
  SupportedLocale,
  TranslationInterpolationMap,
  InterpolationParams,
  CommonKey,
  OnboardingKey,
  HomeworkKey,
  ParentKey,
  SettingsKey,
} from './types';

export { useI18n, TutorSGProvider } from './useI18n';
