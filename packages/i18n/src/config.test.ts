import { describe, it, expect, vi, beforeEach } from 'vitest';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

// --- Locale file integrity tests ---

describe('locale files', () => {
  it('en.json and zh-Hans.json have exactly the same keys', () => {
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zhHans).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it('en.json has no empty values', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en.json key "${key}" is empty`).toBeTruthy();
    }
  });

  it('zh-Hans.json has no empty values', () => {
    for (const [key, value] of Object.entries(zhHans)) {
      expect(value, `zh-Hans.json key "${key}" is empty`).toBeTruthy();
    }
  });

  it('all key names are valid flat identifiers (no i18next special chars)', () => {
    const allKeys = [...Object.keys(en), ...Object.keys(zhHans)];
    for (const key of allKeys) {
      // Dots are allowed in flat-key mode (keySeparator: false disables dot as path separator)
      // Only disallow chars that would break i18next even with keySeparator off
      expect(key).not.toContain(':');
      expect(key).not.toContain('|');
    }
  });

  it('interpolation variables in values match known keys', () => {
    // Keys expected to have interpolation
    const interpolationKeys = [
      'onboarding.download_progress',
      'parent.pin_wrong',
      'subscription.free_tier_desc',
      'worksheet.score',
    ];

    for (const key of interpolationKeys) {
      const enVal = (en as Record<string, string>)[key];
      const zhVal = (zhHans as Record<string, string>)[key];
      expect(enVal, `en.json key "${key}" missing`).toBeDefined();
      expect(zhVal, `zh-Hans.json key "${key}" missing`).toBeDefined();
      // Check that both have at least one {{variable}}
      expect(enVal).toMatch(/\{\{/);
      expect(zhVal).toMatch(/\{\{/);
    }
  });
});

// --- Locale detection tests ---

describe('detectDeviceLocale', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns en for English locale', async () => {
    // Mock expo-localization
    const mockLocales = [
      { languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' },
    ];
    vi.doMock('expo-localization', () => ({
      getLocales: () => mockLocales,
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('returns zh-Hans for zh-CN locale', async () => {
    const mockLocales = [
      { languageTag: 'zh-CN', languageCode: 'zh', regionCode: 'CN' },
    ];
    vi.doMock('expo-localization', () => ({
      getLocales: () => mockLocales,
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('zh-Hans');
  });

  it('returns zh-Hans for zh-SG locale', async () => {
    const mockLocales = [
      { languageTag: 'zh-SG', languageCode: 'zh', regionCode: 'SG' },
    ];
    vi.doMock('expo-localization', () => ({
      getLocales: () => mockLocales,
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('zh-Hans');
  });

  it('returns en for zh-TW locale (Traditional Chinese)', async () => {
    const mockLocales = [
      { languageTag: 'zh-TW', languageCode: 'zh', regionCode: 'TW' },
    ];
    vi.doMock('expo-localization', () => ({
      getLocales: () => mockLocales,
      getCalendars: () => [],
    }));

    const { detectDeviceLocale } = await import('./config');
    expect(detectDeviceLocale()).toBe('en');
  });

  it('returns en for zh-HK locale (Traditional Chinese)', async () => {
    const mockLocales = [
      { languageTag: 'zh-HK', languageCode: 'zh', regionCode: 'HK' },
    ];
    vi.doMock('expo-localization', () => ({
      getLocales: () => mockLocales,
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

// --- i18n initialization test ---

describe('initializeI18n', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('initializes with detected locale (en)', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [{ calendar: 'gregory' }],
    }));

    const mod = await import('./config');
    const i18n = await mod.initializeI18n({ debug: false });

    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
  });

  it('sets locale via setLocale() after initialization', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [{ calendar: 'gregory' }],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Switch to zh-Hans
    expect(mod.default.language).toBe('en');
    await mod.default.changeLanguage('zh-Hans');
    expect(mod.default.language).toBe('zh-Hans');

    // Switch back to en
    await mod.default.changeLanguage('en');
    expect(mod.default.language).toBe('en');
  });

  it('translates known keys correctly (locale switching via changeLanguage)', async () => {
    vi.doMock('expo-localization', () => ({
      getLocales: () => [{ languageTag: 'en-SG', languageCode: 'en', regionCode: 'SG' }],
      getCalendars: () => [{ calendar: 'gregory' }],
    }));

    const mod = await import('./config');
    await mod.initializeI18n({ debug: false });

    // Check a few known translations
    expect(mod.default.t('app.name')).toBe('Tutor SG');
    expect(mod.default.t('common.save')).toBe('Save');
    expect(mod.default.t('common.cancel')).toBe('Cancel');

    // Switch to zh-Hans and verify
    await mod.default.changeLanguage('zh-Hans');
    expect(mod.default.t('app.name')).toBe('Tutor SG 学习助手');
    expect(mod.default.t('common.save')).toBe('保存');
    expect(mod.default.t('common.cancel')).toBe('取消');

    // Switch back
    await mod.default.changeLanguage('en');
    expect(mod.default.t('common.save')).toBe('Save');
  });
});
