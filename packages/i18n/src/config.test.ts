import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { I18nNamespace } from './types';

// --- Import ALL namespace files for consistency checking ---

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

// --- Namespace integrity tests ---

const NAMESPACES: { name: I18nNamespace; en: Record<string, string>; zh: Record<string, string> }[] = [
  { name: 'common', en: commonEn as Record<string, string>, zh: commonZhHans as Record<string, string> },
  { name: 'onboarding', en: onboardingEn as Record<string, string>, zh: onboardingZhHans as Record<string, string> },
  { name: 'homework', en: homeworkEn as Record<string, string>, zh: homeworkZhHans as Record<string, string> },
  { name: 'parent', en: parentEn as Record<string, string>, zh: parentZhHans as Record<string, string> },
  { name: 'settings', en: settingsEn as Record<string, string>, zh: settingsZhHans as Record<string, string> },
];

describe('locale namespace files', () => {
  for (const ns of NAMESPACES) {
    describe(`${ns.name} namespace`, () => {
      it('has exactly the same keys in EN and zh-Hans', () => {
        const enKeys = Object.keys(ns.en).sort();
        const zhKeys = Object.keys(ns.zh).sort();
        expect(enKeys).toEqual(zhKeys);
      });

      it('has no empty values in EN', () => {
        for (const [key, value] of Object.entries(ns.en)) {
          expect(value, `en/${ns.name}.json key "${key}" is empty`).toBeTruthy();
        }
      });

      it('has no empty values in zh-Hans', () => {
        for (const [key, value] of Object.entries(ns.zh)) {
          expect(value, `zh-Hans/${ns.name}.json key "${key}" is empty`).toBeTruthy();
        }
      });

      it('keys do not contain i18next special characters', () => {
        const allKeys = [...Object.keys(ns.en), ...Object.keys(ns.zh)];
        for (const key of allKeys) {
          // Dots are allowed (keySeparator: false = literal dots)
          // Colons would interfere with nsSeparator
          expect(key, `${ns.name}: key "${key}" contains colon`).not.toContain(':');
          // Pipes interfere with i18next
          expect(key, `${ns.name}: key "${key}" contains pipe`).not.toContain('|');
        }
      });

      it('interpolation variables in values use correct format', () => {
        for (const [key, value] of Object.entries(ns.en)) {
          // If a key uses interpolation, both EN and ZH should use it
          const zhVal = ns.zh[key];
          if (value.includes('{{')) {
            expect(zhVal, `${ns.name}: key "${key}" missing interpolation in zh-Hans`).toContain('{{');
          }
        }
      });
    });
  }
});

// --- Locale detection tests ---

describe('detectDeviceLocale', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns en for English locale', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('returns zh-Hans for zh-CN locale', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'zh-CN', languageCode: 'zh', regionCode: 'CN' }],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('zh-Hans');
  });

  it('returns zh-Hans for zh-SG locale', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'zh-SG', languageCode: 'zh', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('zh-Hans');
  });

  it('returns en for zh-TW locale (Traditional Chinese)', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'zh-TW', languageCode: 'zh', regionCode: 'TW' }],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('returns en for zh-HK locale (Traditional Chinese)', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'zh-HK', languageCode: 'zh', regionCode: 'HK' }],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('falls back to en when no locales available', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [],
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('falls back to en when getLocales throws', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => {
        throw new Error('mock error');
      },
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });
});

// --- Calendar detection tests ---

describe('detectIsGregorianCalendar', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns true for Gregorian calendar', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [],
      getCalendars: () => [{ calendar: 'gregory' }],
    }));

    const { detectIsGregorianCalendar } = await import('./config');
    expect(detectIsGregorianCalendar()).toBe(true);
  });

  it('returns false for non-Gregorian calendar', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [],
      getCalendars: () => [{ calendar: 'buddhist' }],
    }));

    const { detectIsGregorianCalendar } = await import('./config');
    expect(detectIsGregorianCalendar()).toBe(false);
  });

  it('falls back to true when calendars API throws', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [],
      getCalendars: () => {
        throw new Error('mock error');
      },
    }));

    const { detectIsGregorianCalendar } = await import('./config');
    expect(detectIsGregorianCalendar()).toBe(true);
  });
});

// --- i18n initialization + namespace correctness tests ---

describe('initializeI18n with namespaces', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('initializes with detected locale', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [{ calendar: 'gregory' }],
    }));

    const mod = await import('./config');
    const i18n = await mod.initializeI18n({ debug: false });

    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
  });

  it('resolves common namespace keys directly', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Common keys (default namespace) — no prefix needed
    expect(mod.default.t('save')).toBe('Save');
    expect(mod.default.t('cancel')).toBe('Cancel');
    expect(mod.default.t('back')).toBe('Back');
    expect(mod.default.t('app.name')).toBe('Tutor SG');
    expect(mod.default.t('math')).toBe('Math');
    expect(mod.default.t('science')).toBe('Science');
  });

  it('resolves other namespace keys via ns: prefix', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Namespaced keys via prefix
    expect(mod.default.t('onboarding:welcome_title')).toBe('Welcome to Tutor SG');
    expect(mod.default.t('homework:title')).toBe('Homework Camera');
    expect(mod.default.t('parent:pin_title')).toBe('Parent PIN');
    expect(mod.default.t('settings:subscription_title')).toBe('Unlock Full Access');
  });

  it('resolves namespace keys via ns option', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Namespaced keys via { ns } option
    expect(mod.default.t('welcome_title', { ns: 'onboarding' })).toBe('Welcome to Tutor SG');
    expect(mod.default.t('pin_title', { ns: 'parent' })).toBe('Parent PIN');
  });

  it('switches locale and resolves all namespaces', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Verify EN
    expect(mod.default.t('save')).toBe('Save');
    expect(mod.default.t('onboarding:get_started')).toBe('Get Started');
    expect(mod.default.t('homework:capture')).toBe('Take a photo of your homework');
    expect(mod.default.t('parent:log_empty')).toBe('No homework sessions yet. Ask your child to try the Camera feature!');
    expect(mod.default.t('settings:subscription_free_tier')).toBe('Free');

    // Switch to zh-Hans
    await mod.default.changeLanguage('zh-Hans');
    expect(mod.default.t('save')).toBe('保存');
    expect(mod.default.t('onboarding:get_started')).toBe('开始使用');
    expect(mod.default.t('homework:capture')).toBe('拍一张作业照片');
    expect(mod.default.t('parent:log_empty')).toBe('还没有作业记录。让孩子试试拍照功能吧！');
    expect(mod.default.t('settings:subscription_free_tier')).toBe('免费版');

    // Switch back
    await mod.default.changeLanguage('en');
    expect(mod.default.t('save')).toBe('Save');
  });
});
