/**
 * Tests for shared config/env module.
 *
 * Covers:
 * - Default values for createEnv()
 * - EXPO_PUBLIC_ environment variable prefix resolution
 * - Override passthrough
 * - App environment validation (invalid values throw)
 * - validateEnv() with placeholder detection
 * - validateEnv() with proper configuration (no errors)
 */

import { createEnv, validateEnv } from '../../src/config/env';

describe('createEnv — defaults', () => {
  it('APP_ENV defaults to development', () => {
    const cfg = createEnv();
    expect(cfg.APP_ENV).toBe('development');
  });

  it('ENABLE_DEV_TOOLS defaults to false', () => {
    const cfg = createEnv();
    expect(cfg.ENABLE_DEV_TOOLS).toBe(false);
  });

  it('LOG_LEVEL defaults to info', () => {
    const cfg = createEnv();
    expect(cfg.LOG_LEVEL).toBe('info');
  });

  it('CDN_BASE_URL has a default', () => {
    const cfg = createEnv();
    expect(cfg.CDN_BASE_URL).toBe('https://cdn.example.com/models/');
  });
});

describe('createEnv — EXPO_PUBLIC_ prefix', () => {
  beforeEach(() => {
    // Clear any test env vars
    delete process.env['EXPO_PUBLIC_APP_ENV'];
    delete process.env['EXPO_PUBLIC_ENABLE_DEV_TOOLS'];
    delete process.env['EXPO_PUBLIC_CDN_BASE_URL'];
  });

  it('picks up EXPO_PUBLIC_APP_ENV', () => {
    process.env['EXPO_PUBLIC_APP_ENV'] = 'staging';
    expect(createEnv().APP_ENV).toBe('staging');
  });

  it('parses EXPO_PUBLIC_ENABLE_DEV_TOOLS as boolean', () => {
    process.env['EXPO_PUBLIC_ENABLE_DEV_TOOLS'] = 'true';
    expect(createEnv().ENABLE_DEV_TOOLS).toBe(true);
  });

  it('picks up EXPO_PUBLIC_CDN_BASE_URL', () => {
    process.env['EXPO_PUBLIC_CDN_BASE_URL'] = 'https://cdn.test.dev/models/';
    expect(createEnv().CDN_BASE_URL).toBe('https://cdn.test.dev/models/');
  });
});

describe('createEnv — overrides', () => {
  it('overrides APP_ENV via parameter', () => {
    const cfg = createEnv({ APP_ENV: 'production' });
    expect(cfg.APP_ENV).toBe('production');
  });

  it('overrides SUPABASE_URL via parameter', () => {
    const cfg = createEnv({ SUPABASE_URL: 'https://real.supabase.co' });
    expect(cfg.SUPABASE_URL).toBe('https://real.supabase.co');
  });
});

describe('createEnv — validation', () => {
  it('throws on invalid APP_ENV', () => {
    expect(() => createEnv({ APP_ENV: 'no_such_env' as 'development' })).toThrow();
  });
});

describe('validateEnv', () => {
  it('returns errors for placeholder values', () => {
    const cfg = createEnv();
    const errors = validateEnv(cfg);
    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(errors.some((e: string) => e.includes('Supabase URL'))).toBe(true);
    expect(errors.some((e: string) => e.includes('Supabase anon key'))).toBe(true);
  });

  it('returns no errors when properly configured', () => {
    const good = createEnv({
      SUPABASE_URL: 'https://abcd.supabase.co',
      SUPABASE_ANON_KEY: 'real-key',
      CDN_BASE_URL: 'https://cdn.real.dev/models/',
    });
    expect(validateEnv(good)).toHaveLength(0);
  });
});
