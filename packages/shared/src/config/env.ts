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
 * Public vars are parsed and validated at import time. Secret vars are
 * **never** accessed from this module — they live in EAS / CI secrets and
 * are injected server-side only.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const appEnvSchema = z.enum(['development', 'staging', 'production']);
const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

const envSchema = z.object({
  APP_ENV: appEnvSchema.default('development'),
  ENABLE_DEV_TOOLS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  LOG_LEVEL: logLevelSchema.default('info'),
  CDN_BASE_URL: z.string().url().default('https://cdn.example.com/models/'),
  MODEL_INDEX_PATH: z.string().default('index.json'),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  HITPAY_API_KEY: z.string().default('placeholder-hitpay-public-key'),
});

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripExpoPublic(key: string): string {
  return key.replace(/^EXPO_PUBLIC_/, '');
}

function extractPublicEnv(): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [rawKey, value] of Object.entries(process.env)) {
    if (rawKey.startsWith('EXPO_PUBLIC_')) {
      const shortKey = stripExpoPublic(rawKey);
      if (value !== undefined) result[shortKey] = value;
    }
  }
  for (const [rawKey, value] of Object.entries(process.env)) {
    if (!rawKey.startsWith('EXPO_PUBLIC_') && value !== undefined) {
      if (!(rawKey in result) || result[rawKey] === undefined) {
        if (rawKey in envSchema.shape) result[rawKey] = value;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Factory + singleton
// ---------------------------------------------------------------------------

export function createEnv(overrides?: Partial<z.input<typeof envSchema>>) {
  const raw = { ...extractPublicEnv(), ...overrides };
  return envSchema.parse(raw);
}

export const env = createEnv();

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateEnv(targetEnv?: Env): string[] {
  const e = targetEnv ?? env;
  const issues: string[] = [];
  const placeholders = ['placeholder-anon-key', 'https://placeholder.supabase.co', 'https://cdn.example.com/models/'];
  for (const {key, label} of [
    {key: 'SUPABASE_URL' as keyof Env, label: 'Supabase URL'},
    {key: 'SUPABASE_ANON_KEY' as keyof Env, label: 'Supabase anon key'},
    {key: 'CDN_BASE_URL' as keyof Env, label: 'CDN base URL'},
  ]) {
    const val = e[key] as string | undefined;
    if (!val || placeholders.includes(val)) {
      issues.push(label + ' is not configured (' + key + ' is a placeholder)');
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------

export const isProduction = env.APP_ENV === 'production';
export const isDevToolsEnabled = !isProduction && env.ENABLE_DEV_TOOLS;
