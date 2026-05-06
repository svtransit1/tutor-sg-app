export const KID_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
export type KidLevel = (typeof KID_LEVELS)[number];
export const MAX_KIDS = 4;
export const MAX_NAME_LENGTH = 30;
export const SUPPORTED_LOCALES = ['en', 'zh-Hans'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
