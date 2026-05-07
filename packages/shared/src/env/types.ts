/**
 * Environment variable types and defaults.
 * These types mirror the vars declared in .env.local.example.
 *
 * Build-time vars (read by app.config.ts at build/expo start):
 * - APP_NAME, APP_BUNDLE_ID, APP_VERSION
 * - SUPABASE_URL, SUPABASE_ANON_KEY
 * - R2_CDN_BASE_URL, R2_CDN_API_TOKEN
 * - DEBUG_MODE, SENTRY_ENABLED, SENTRY_DSN
 * - HITPAY_API_KEY, HITPAY_WEBHOOK_SECRET
 *
 * Runtime vars (read from expo-constants / extra):
 * - SUPABASE_URL, SUPABASE_ANON_KEY
 * - R2_CDN_BASE_URL
 * - DEBUG_MODE
 *
 * Runtime secrets (read from SecureStorage):
 * - MODEL_CDN_SIGNING_KEY
 */

/** Build-time config that ends up in Constants.extra */
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  r2CdnBaseUrl: string;
  debugMode: boolean;
  environment: string;
}

/** Device override for UI testing — set via .env.local DEV_FORCE_DEVICE_TIER */
export type DeviceTier = "high" | "mid" | "unsupported";

export const DEFAULT_APP_CONFIG: AppConfig = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  r2CdnBaseUrl: "",
  debugMode: false,
  environment: "development",
};