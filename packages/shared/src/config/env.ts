/**
 * @module config/env
 *
 * Typed environment-config loader for tutor-sg.
 *
 * ## Convention
 *
 * | Prefix              | Visibility        | Use                                 |
 * |---------------------|-------------------|-------------------------------------|
 * | `EXPO_PUBLIC_*`     | Bundled in binary | CDN URLs, Supabase anon key, flags  |
 * | `*` (no prefix)     | Build-time / CI   | Service-role keys, payment secrets  |
 *
 * Public vars are parsed and validated at import time.  Secret vars are
 * **never** accessed from this module — they live in EAS / CI secrets and
 * are injected server-side only.
 *
 * ## Adding a new variable
 *
 * 1. Add a Zod schema entry in `envSchema`.
 * 2. Add a doc comment in `.env.example`.
 * 3. If public (`EXPO_PUBLIC_*`), it will be available on `env.*`.
 * 4. If secret, configure via EAS Secrets / GitHub Actions Secrets.
 *
 * ## Testing
 *
 * Tests can override values by setting `process.env` before importing,
 * or by injecting the parsed env through the DI-friendly `createEnv()` factory.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const appEnvSchema = z.enum(['development', 'staging', 'production']);
const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

const envSchema = z.object({
  // -- App ----------------------------------------------------------------
  APP_ENV: appEnvSchema.default('development'),
  ENABLE_DEV_TOOLS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  LOG_LEVEL: logLevelSchema.default('info'),

  // -- CDN ----------------------------------------------------------------
  CDN_BASE_URL: z
    .string()
    .url()
    .default('https://cdn.example.com/models/'),
  MODEL_INDEX_PATH: z.string().default('index.json'),

  // -- Supabase ------------------------------------------------------------
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),

  // -- HitPay (public key only) --------------------------------------------
  HITPAY_API_KEY: z.string().default('placeholder-hitpay-public-key'),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip the `EXPO_PUBLIC_` prefix from an env var name.
 *
 *   `EXPO_PUBLIC_CDN_BASE_URL` → `CDN_BASE_URL`
 */
function stripExpoPublic(key: string): string {
  return key.replace(/^EXPO_PUBLIC_/, '');
}

/**
 * Build a plain object from process.env that maps unprefixed keys
 * (e.g. `CDN_BASE_URL`) to their `EXPO_PUBLIC_*` values.
 *
 * Non-prefixed keys are also included so CI / test can set them directly.
 */
function extractPublicEnv(): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [rawKey, value] of Object.entries(process.env)) {
    if (rawKey.startsWith('EXPO_PUBLIC_')) {
      const shortKey = stripExpoPublic(rawKey);
      if (value !== undefined) {
        result[shortKey] = value;
      }
    }
  }

  // Also pick up raw (non-prefixed) keys that match the schema, so tests
  // and CI can set them directly.  Prefixed keys take precedence.
  for (const [rawKey, value] of Object.entries(process.env)) {
    if (!rawKey.startsWith('EXPO_PUBLIC_') && value !== undefined) {
      // Only add if not already set via the prefixed path
      if (!(stripExpoPublic(rawKey) in result) || result[stripExpoPublic(rawKey)] === undefined) {
        // Check if this key matches a schema key (case-sensitive)
        if (rawKey in envSchema.shape) {
          result[rawKey] = value;
        }
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/**
 * Parse and validate environment variables.
 *
 * Returns the validated config object.  Throws if required variables are
 * missing or malformed (caught by the caller at app startup).
 */
export function createEnv(overrides?: Partial<z.input<typeof envSchema>>) {
  const raw = { ...extractPublicEnv(), ...overrides };
  return envSchema.parse(raw);
}

/**
 * The singleton env config.  Parsed once at module load.
 *
 * In production, missing values fall back to schema defaults — but you
 * should ensure all required vars are set in EAS Build / CI.
 */
export const env = createEnv();

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Validation helper for app startup
// ---------------------------------------------------------------------------

/**
 * Validate the environment at app startup.
 *
 * Checks that all required variables (those without a `.default()` in the
 * schema) are present.  Returns a list of human-readable error messages,
 * or an empty array if everything is valid.
 *
 * Call this during app initialization and surface any errors before the
 * user can interact.
 */
export function validateEnv(): string[] {
  const issues: string[] = [];

  const required: { key: string; label: string }[] = [
    { key: 'SUPABASE_URL', label: 'Supabase URL' },
    { key: 'SUPABASE_ANON_KEY', label: 'Supabase anon key' },
    { key: 'CDN_BASE_URL', label: 'CDN base URL' },
  ];

  for (const { key, label } of required) {
    const val = (env as Record<string, unknown>)[key];
    if (!val || val === 'placeholder-anon-key' || val === 'https://placeholder.supabase.co') {
      issues.push(`${label} is not configured (${key} is a placeholder)`);
    }
  }

  return issues;
}

/**
 * True in production builds.
 */
export const isProduction = env.APP_ENV === 'production';

/**
 * True when dev tools should be shown.
 *
 * Always false in production, regardless of the flag value.
 */
export const isDevToolsEnabled = !isProduction && env.ENABLE_DEV_TOOLS;
