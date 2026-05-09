import en from '../locales/en.json';
import zh from '../locales/zh-Hans.json';

function collectLeafKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') {
      const children = collectLeafKeys(v as Record<string, unknown>, path);
      children.forEach((c) => keys.add(c));
    } else {
      keys.add(path);
    }
  }
  return keys;
}

function findStringValue(obj: Record<string, unknown>, dottedKey: string): string | null {
  // First try: treat the key as a flat key (app.loading → obj['app.loading'])
  const flat = obj[dottedKey];
  if (typeof flat === 'string') return flat;

  // Second try: navigate nested path (onboarding.welcome.title → obj['onboarding']['welcome']['title'])
  const parts = dottedKey.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
    if (current === undefined) return null;
  }
  return typeof current === 'string' ? current : null;
}

describe('bilingual completeness', () => {
  it('en.json and zh-Hans.json have exactly matching leaf keys', () => {
    const enKeys = collectLeafKeys(en);
    const zhKeys = collectLeafKeys(zh);

    const onlyEn = [...enKeys].filter((k) => !zhKeys.has(k));
    const onlyZh = [...zhKeys].filter((k) => !enKeys.has(k));

    const message: string[] = [];
    if (onlyEn.length > 0) {
      message.push(`Keys missing in zh-Hans.json (${onlyEn.length}):`);
      message.push(onlyEn.join('\n'));
    }
    if (onlyZh.length > 0) {
      message.push(`Keys missing in en.json (${onlyZh.length}):`);
      message.push(onlyZh.join('\n'));
    }
    if (message.length > 0) {
      throw new Error(message.join('\n\n'));
    }

    expect(enKeys.size).toBe(zhKeys.size);
  });

  it('every string key in en.json has a non-empty value', () => {
    const keys = collectLeafKeys(en);
    for (const key of keys) {
      const value = findStringValue(en, key);
      expect(value).not.toBeNull();
      expect(value!.trim().length).toBeGreaterThan(0);
    }
  });

  it('every string key in zh-Hans.json has a non-empty value', () => {
    const keys = collectLeafKeys(zh);
    for (const key of keys) {
      const value = findStringValue(zh, key);
      expect(value).not.toBeNull();
      expect(value!.trim().length).toBeGreaterThan(0);
    }
  });
});
