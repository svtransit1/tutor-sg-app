/**
 * Supabase client singleton.
 *
 * Initialises the Supabase client with the project URL and anon key from
 * environment configuration. Used for parent auth (email magic link,
 * Google/Apple OAuth), IAP receipt validation, and opt-in telemetry.
 *
 * Per ADD §6.5: parent auth only — kid data never leaves the device.
 * Per ADD §7: backend is minimal — auth + IAP + opt-in telemetry sink.
 */
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL: string =
  Constants.expoConfig?.extra?.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY: string =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Auth will fail at runtime. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
