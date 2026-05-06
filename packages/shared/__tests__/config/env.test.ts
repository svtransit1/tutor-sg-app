/**
 * Unit tests for the environment config module.
 *
 * These tests validate:
 *   1. EXPO_PUBLIC_* prefix stripping
 *   2. Default values when vars are unset
 *   3. Override via createEnv()
 *   4. validateEnv() placeholder detection
 *   5. isProduction / isDevToolsEnabled logic
 */

import { createEnv, validateEnv, isProduction, isDevToolsEnabled } from '../../src/config/env';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Save and restore process.env around a test block. */
function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void,
) {
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    saved[key] = process.env[key];
  }
  try {
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    fn();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('config/env', () => {
  // -- createEnv -----------------------------------------------------------

  describe('createEnv', () => {
    it('returns defaults when no vars are set', () => {
      withEnv({ EXPO_PUBLIC_APP_ENV: undefined }, () => {
        const cfg = createEnv();
        expect(cfg.APP_ENV).toBe('development');
        expect(cfg.ENABLE_DEV_TOOLS).toBe(false);
        expect(cfg.LOG_LEVEL).toBe('info');
      });
    });

    it('picks up EXPO_PUBLIC_ prefixed vars', () => {
      withEnv(
        {
          EXPO_PUBLIC_APP_ENV: 'staging',
          EXPO_PUBLIC_CDN_BASE_URL: 'https://cdn.test.dev/models/',
          EXPO_PUBLIC_ENABLE_DEV_TOOLS: 'true',
        },
        () => {
          const cfg = createEnv();
          expect(cfg.APP_ENV).toBe('staging');
          expect(cfg.CDN_BASE_URL).toBe('https://cdn.test.dev/models/');
          expect(cfg.ENABLE_DEV_TOOLS).toBe(true);
        },
      );
    });

    it('accepts overrides via createEnv() argument', () => {
      withEnv({ EXPO_PUBLIC_APP_ENV: undefined }, () => {
        const cfg = createEnv({ APP_ENV: 'production', ENABLE_DEV_TOOLS: false });
        expect(cfg.APP_ENV).toBe('production');
        expect(cfg.ENABLE_DEV_TOOLS).toBe(false);
      });
    });

    it('overrides take precedence over EXPO_PUBLIC_ values', () => {
      withEnv(
        { EXPO_PUBLIC_APP_ENV: 'staging' },
        () => {
          const cfg = createEnv({ APP_ENV: 'production' });
          expect(cfg.APP_ENV).toBe('production');
        },
      );
    });

    it('throws on invalid APP_ENV value', () => {
      expect(() =>
        createEnv({ APP_ENV: 'no_such_env' as 'development' }),
      ).toThrow();
    });

    it('parses ENABLE_DEV_TOOLS "false" → false', () => {
      const cfg = createEnv({ ENABLE_DEV_TOOLS: 'false' as 'false' });
      expect(cfg.ENABLE_DEV_TOOLS).toBe(false);
    });
  });

  // -- validateEnv ---------------------------------------------------------

  describe('validateEnv', () => {
    it('returns errors for placeholder default values', () => {
      withEnv(
        {
          EXPO_PUBLIC_SUPABASE_URL: undefined,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: undefined,
          EXPO_PUBLIC_CDN_BASE_URL: undefined,
        },
        () => {
          const errors = validateEnv();
          expect(errors.length).toBeGreaterThanOrEqual(3);
          expect(errors.some((e) => e.includes('Supabase URL'))).toBe(true);
          expect(errors.some((e) => e.includes('Supabase anon key'))).toBe(true);
        },
      );
    });

    it('returns no errors when all vars are properly set', () => {
      withEnv(
        {
          EXPO_PUBLIC_SUPABASE_URL: 'https://abcd.supabase.co',
          EXPO_PUBLIC_SUPABASE_ANON_KEY: 'real-anon-key-1234',
          EXPO_PUBLIC_CDN_BASE_URL: 'https://cdn.real.dev/models/',
        },
        () => {
          const errors = validateEnv();
          expect(errors).toEqual([]);
        },
      );
    });
  });

  // -- derived helpers -----------------------------------------------------

  describe('isProduction', () => {
    it('is true when APP_ENV=production', () => {
      withEnv({ EXPO_PUBLIC_APP_ENV: 'production' }, () => {
        expect(isProduction).toBe(true);
      });
    });

    it('is false when APP_ENV=development', () => {
      withEnv({ EXPO_PUBLIC_APP_ENV: 'development' }, () => {
        expect(isProduction).toBe(false);
      });
    });
  });

  describe('isDevToolsEnabled', () => {
    it('is false in production regardless of flag', () => {
      withEnv(
        {
          EXPO_PUBLIC_APP_ENV: 'production',
          EXPO_PUBLIC_ENABLE_DEV_TOOLS: 'true',
        },
        () => {
          expect(isDevToolsEnabled).toBe(false);
        },
      );
    });

    it('respects the flag in development', () => {
      withEnv(
        {
          EXPO_PUBLIC_APP_ENV: 'development',
          EXPO_PUBLIC_ENABLE_DEV_TOOLS: 'true',
        },
        () => {
          expect(isDevToolsEnabled).toBe(true);
        },
      );
    });
  });
});
