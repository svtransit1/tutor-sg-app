/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** Supabase project URL — used for parent auth + IAP validation. */
    EXPO_PUBLIC_SUPABASE_URL?: string;
    /** Supabase anonymous key — used for parent auth. */
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    /** Cloudflare R2 CDN base URL for model files (index.json + model weights). */
    EXPO_PUBLIC_MODEL_CDN_URL?: string;
    /** R2 API token for signed URL generation (optional — only if bucket requires auth). */
    EXPO_PUBLIC_MODEL_CDN_API_TOKEN?: string;
    /** HitPay API key for payment initialisation (M6 milestone). */
    EXPO_PUBLIC_HITPAY_API_KEY?: string;
    /** Opt-in anonymised telemetry sink endpoint. Defaults to Supabase if unset. */
    EXPO_PUBLIC_TELEMETRY_ENDPOINT?: string;
    /** App environment: development | staging | production. */
    EXPO_PUBLIC_APP_ENV?: string;
  }
}
