import commonEn from './locales/en/common.json';
import onboardingEn from './locales/en/onboarding.json';
import homeworkEn from './locales/en/homework.json';
import parentEn from './locales/en/parent.json';
import settingsEn from './locales/en/settings.json';

import commonZhHans from './locales/zh-Hans/common.json';
import onboardingZhHans from './locales/zh-Hans/onboarding.json';
import homeworkZhHans from './locales/zh-Hans/homework.json';
import parentZhHans from './locales/zh-Hans/parent.json';
import settingsZhHans from './locales/zh-Hans/settings.json';

export const NAMESPACES = ['common', 'onboarding', 'homework', 'parent', 'settings'] as const;
export type I18nNamespace = (typeof NAMESPACES)[number];
export const DEFAULT_NS: I18nNamespace = 'common';

export type CommonKey = keyof typeof commonEn;
export type OnboardingKey = keyof typeof onboardingEn;
export type HomeworkKey = keyof typeof homeworkEn;
export type ParentKey = keyof typeof parentEn;
export type SettingsKey = keyof typeof settingsEn;

type _assertSameKeys<T, U> = [keyof T, keyof U] extends [keyof U, keyof T]
  ? true
  : { mismatch: true; missingInSecond: Exclude<keyof T, keyof U>; missingInFirst: Exclude<keyof U, keyof T> };

type _commonConsistency = _assertSameKeys<typeof commonEn, typeof commonZhHans>;
type _onboardingConsistency = _assertSameKeys<typeof onboardingEn, typeof onboardingZhHans>;
type _homeworkConsistency = _assertSameKeys<typeof homeworkEn, typeof homeworkZhHans>;
type _parentConsistency = _assertSameKeys<typeof parentEn, typeof parentZhHans>;
type _settingsConsistency = _assertSameKeys<typeof settingsEn, typeof settingsZhHans>;

export type TranslationKey =
  | CommonKey
  | `common:${CommonKey}`
  | `onboarding:${OnboardingKey}`
  | `homework:${HomeworkKey}`
  | `parent:${ParentKey}`
  | `settings:${SettingsKey}`;

export type SupportedLocale = 'en' | 'zh-Hans';

export type TranslationInterpolationMap = {
  'onboarding:download_progress': { percent: string };
  'onboarding:download_cellular_desc': { size: string };
  'onboarding:download_retrying': { attempt: string | number; max: string | number };
  'onboarding:download_eta': { time: string };
  'onboarding:download_speed': { speed: string };
  'onboarding:onboarding_step': { current: string | number; total: string | number };
  'homework:worksheet_score': { correct: string | number; total: string | number };
  'homework:question_number': { number: string | number };
  'parent:pin_wrong': { attempts: string | number };
  'parent:log_min_ago': { min: string | number };
  'settings:subscription_free_tier_desc': { photos: string; questions: string };
  'settings:subscription_month': { price: string };
  'settings:subscription_year': { price: string };
  'settings:about_version': { version: string };
};

export type InterpolationParams<K extends TranslationKey> =
  K extends keyof TranslationInterpolationMap
    ? TranslationInterpolationMap[K]
    : undefined;
