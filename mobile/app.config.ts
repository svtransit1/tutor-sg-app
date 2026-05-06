/**
 * Expo app.config.ts — dynamic configuration.
 *
 * Maps environment variables into Expo's config tree so they are available
 * at runtime via `expo-constants` (`Constants.expoConfig.extra`).
 *
 * EXPO_PUBLIC_* vars are automatically inlined by Expo CLI / EAS Build
 * into `process.env` at build time.  This file additionally makes selected
 * values available through the standard `expoConfig.extra` path for code
 * that prefers `expo-constants` access.
 *
 * ## Secret handling
 *
 * Secrets (SUPABASE_SERVICE_ROLE_KEY, HITPAY_SECRET_KEY, etc.) are
 * injected here via EAS Build secrets / `process.env` at build time,
 * but they are NOT exposed as `EXPO_PUBLIC_*` and will not be bundled
 * into the client binary.
 *
 * ## Env-file loading
 *
 * During local development the Expo CLI automatically loads `.env.local`
 * (and `.env`) files from the project root.  No additional plugin needed.
 */

import { type ExpoConfig } from '@expo/config-types';

/**
 * Helper: read a value from process.env with optional default.
 */
function getEnv(key: string, fallback?: string): string | undefined {
  // Check unprefixed first (CI / test / manual override), then EXPO_PUBLIC_
  const val = process.env[key] ?? process.env[`EXPO_PUBLIC_${key}`];
  return val ?? fallback;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const config: ExpoConfig = {
  name: 'tutor-sg',
  slug: 'tutor-sg',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'tutor-sg',

  // -------------------------------------------------------------------
  // Assets (placeholder — replace with final design assets before M7)
  // -------------------------------------------------------------------
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4A90D9',
  },

  // -------------------------------------------------------------------
  // iOS
  // -------------------------------------------------------------------
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aaas.tutorsg',
    infoPlist: {
      NSCameraUsageDescription: 'Take photos of homework for AI tutoring',
    },
  },

  // -------------------------------------------------------------------
  // Android
  // -------------------------------------------------------------------
  android: {
    package: 'com.aaas.tutorsg',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4A90D9',
    },
    permissions: ['android.permission.CAMERA'],
  },

  // -------------------------------------------------------------------
  // Plugins
  // -------------------------------------------------------------------
  plugins: ['expo-router', 'expo-localization'],

  // -------------------------------------------------------------------
  // Runtime config — available via Constants.expoConfig.extra
  // -------------------------------------------------------------------
  extra: {
    APP_ENV: getEnv('APP_ENV', 'development'),
    CDN_BASE_URL: getEnv('CDN_BASE_URL', 'https://cdn.example.com/models/'),
    SUPABASE_URL: getEnv('SUPABASE_URL', 'https://placeholder.supabase.co'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY', 'placeholder-anon-key'),
    HITPAY_API_KEY: getEnv('HITPAY_API_KEY', 'placeholder-hitpay-public-key'),
    ENABLE_DEV_TOOLS: getEnv('ENABLE_DEV_TOOLS', 'false') === 'true',
    LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),

    // -------------------------------------------------------------------
    // Secrets (build-time only — NOT bundled into the client)
    //
    // These are consumed by EAS Build plugins or post-processing scripts.
    // They are listed here so the config shape is documented, but their
    // values come from EAS Secrets, not from .env files.
    // -------------------------------------------------------------------
    // SUPABASE_SERVICE_ROLE_KEY is NOT included here — it is server-side only.
  },

  experiments: {
    typedRoutes: true,
  },
};

export default config;
