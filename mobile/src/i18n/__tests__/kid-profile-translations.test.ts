import { readFileSync } from 'fs';
import { resolve } from 'path';
import en from '../en.json';
import zh from '../zh-Hans.json';

const requiredKeys = [
  'onboarding.kidSetup.title',
  'onboarding.kidSetup.editTitle',
  'onboarding.kidSetup.deleteProfile',
  'onboarding.kidSetup.save',
  'onboarding.kidList.confirmDelete',
  'onboarding.kidList.confirmDeleteDesc',
  'onboarding.kidProfile.maxKids',
  'onboarding.common.error',
] as const;

function lookup(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, source);
}

describe('kid profile translations', () => {
  function expectKidSetupKeys(resources: unknown): void {
    for (const key of requiredKeys) {
      const value = lookup(resources, key);
      expect(typeof value).toBe('string');
      expect(value).not.toBe('');
    }
  }

  it('defines every kid setup key in en', () => {
    expectKidSetupKeys(en);
  });

  it('defines every kid setup key in zh-Hans', () => {
    expectKidSetupKeys(zh);
  });

  it('does not hard-code the max-kids alert copy in the kid setup route', () => {
    const source = readFileSync(
      resolve(__dirname, '../../../app/(onboarding)/kid-setup.tsx'),
      'utf8',
    );

    expect(source.includes("Alert.alert('Error'")).toBe(false);
    expect(source.includes('Maximum number of children reached.')).toBe(false);
  });
});
