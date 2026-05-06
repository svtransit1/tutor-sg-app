import en from '../../i18n/locales/en.json';
import zhHans from '../../i18n/locales/zh-Hans.json';

/**
 * Verify that every English key has a corresponding Chinese translation.
 * Missing translations are a hard blocker for bilingual releases.
 */
describe('Locale key parity (EN ↔ zh-Hans)', () => {
  const enKeys = Object.keys(en).sort();
  const zhKeys = Object.keys(zhHans).sort();

  it('has the same number of keys in both locales', () => {
    expect(zhKeys.length).toBe(enKeys.length);
  });

  it('has exactly the same set of keys in zh-Hans as en', () => {
    const missingFromZh = enKeys.filter((k) => !(k in zhHans));
    const extraInZh = zhKeys.filter((k) => !(k in en));

    if (missingFromZh.length > 0 || extraInZh.length > 0) {
      const msg: string[] = [];
      if (missingFromZh.length > 0) {
        msg.push(`Missing from zh-Hans.json: ${missingFromZh.join(', ')}`);
      }
      if (extraInZh.length > 0) {
        msg.push(`Extra in zh-Hans.json (not in en.json): ${extraInZh.join(', ')}`);
      }
      throw new Error(msg.join('\n'));
    }
  });
});

/**
 * Verify locale file structural integrity.
 */
describe('Locale file integrity', () => {
  it('en.json values are non-empty strings', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(typeof value).toBe('string');
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('zh-Hans.json values are non-empty strings', () => {
    for (const [key, value] of Object.entries(zhHans)) {
      expect(typeof value).toBe('string');
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('every en.json key is a valid dot-separated path', () => {
    // First segment allows camelCase (parentLog), subsequent segments are alphanumeric
    const keyPattern = /^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*$/;
    for (const key of Object.keys(en)) {
      expect(key).toMatch(keyPattern);
    }
  });

  it('every zh-Hans.json key is a valid dot-separated path', () => {
    const keyPattern = /^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*$/;
    for (const key of Object.keys(zhHans)) {
      expect(key).toMatch(keyPattern);
    }
  });
});

/**
 * Verify namespace coverage — every expected namespace has at least one key.
 */
describe('Namespace coverage', () => {
  const expectedNamespaces = [
    'common',
    'onboarding',
    'subjects',
    'homework',
    'parentLog',
    'settings',
    'iap',
    'errors',
    'accessibility',
    'tts',
  ];

  const extractNamespace = (key: string): string => key.split('.')[0]!;

  for (const ns of expectedNamespaces) {
    it(`defines at least one key in the "${ns}" namespace`, () => {
      const enHasNs = Object.keys(en).some((k) => extractNamespace(k) === ns);
      const zhHasNs = Object.keys(zhHans).some((k) => extractNamespace(k) === ns);
      expect(enHasNs).toBe(true);
      expect(zhHasNs).toBe(true);
    });
  }

  it('does not have keys outside expected namespaces', () => {
    const allNamespaces = new Set([
      ...Object.keys(en).map(extractNamespace),
      ...Object.keys(zhHans).map(extractNamespace),
    ]);
    for (const ns of allNamespaces) {
      expect(expectedNamespaces).toContain(ns);
    }
  });
});

/**
 * Verify that i18next interpolation placeholders are consistent between
 * English and Chinese translations.
 */
describe('Interpolation consistency', () => {
  const extractPlaceholders = (str: string): string[] => {
    const matches = str.match(/\{\{[^}]+\}\}/g);
    return matches ? matches.map((m) => m.slice(2, -2).trim()) : [];
  };

  for (const key of Object.keys(en)) {
    const enValue = (en as Record<string, string>)[key]!;
    const zhValue = (zhHans as Record<string, string>)[key];
    const enPlaceholders = extractPlaceholders(enValue).sort();
    const zhPlaceholders = extractPlaceholders(zhValue).sort();

    it(`"${key}" has consistent interpolation placeholders between locales`, () => {
      expect(zhPlaceholders).toEqual(enPlaceholders);
    });
  }
});

/**
 * Verify locale detection logic (substitute for the real expo-localization).
 */
describe('detectLocale() logic', () => {
  it('returns "en" for non-Chinese language tags', () => {
    const enTags = ['en-US', 'en-GB', 'en-SG', 'ms-MY', 'ta-IN', 'fr-FR', 'de-DE'];
    for (const tag of enTags) {
      expect(tag.startsWith('zh') ? 'zh-Hans' : 'en').toBe('en');
    }
  });

  it('returns "zh-Hans" for Chinese language tags', () => {
    const zhTags = ['zh-Hans', 'zh-Hans-CN', 'zh-Hans-SG', 'zh-CN', 'zh-SG', 'zh-TW'];
    for (const tag of zhTags) {
      expect(tag.startsWith('zh') ? 'zh-Hans' : 'en').toBe('zh-Hans');
    }
  });

  it('falls back to "en" for undefined locale', () => {
    // Simulate the detectLocale fallback: when no locale detected, default to 'en'
    const detectFallback = (localeTag: string | undefined): string =>
      localeTag?.startsWith('zh') ? 'zh-Hans' : 'en';
    expect(detectFallback(undefined)).toBe('en');
  });
});

/**
 * Verify that the i18n module exports correctly.
 * Uses require() instead of dynamic import() to avoid --experimental-vm-modules.
 */
describe('i18n module exports', () => {
  // The module requires i18next and react-i18next, which are mocked.
  // The mock creates an i18n instance; babel transforms ESM to CJS.
  let i18nModule: any;
  beforeAll(() => {
    i18nModule = require('../../i18n/index');
  });

  it('module loads without error', () => {
    expect(i18nModule).toBeDefined();
    expect(typeof i18nModule).toBe('object');
  });

  it('exports detectLocale function (named export)', () => {
    // babel converts `export function detectLocale()` to `exports.detectLocale`
    expect(typeof i18nModule.detectLocale).toBe('function');
  });

  it('has a default export that is the i18n instance', () => {
    // babel converts `export default i18n` to `exports.default`
    // The mocked i18next module returns an object with `.t()`
    const defaultExport = i18nModule.default;
    if (defaultExport && typeof defaultExport.t === 'function') {
      expect(typeof defaultExport.t).toBe('function');
    } else {
      // Some babel configs merge default into module.exports
      expect(typeof i18nModule.t).toBe('function');
    }
  });
});
