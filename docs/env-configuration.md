# Environment Configuration

> **Architecture principle (ADD §7):** Secrets are never committed. Use `.env.local` for local development and a cloud secrets manager for production.

## Quick start

1. Copy `.env.local.example` to `.env.local` at the repo root
2. Fill in your Supabase project credentials
3. Run `pnpm install` — Expo will pick up the vars automatically

## File overview

| File | Purpose | Committed? |
|---|---|---|
| `.env.local.example` | All vars documented, no values | Yes |
| `.env.local` | Your local dev values | **No** (gitignored) |
| `.env.production.example` | Production template | Yes |
| `app.config.ts` | Reads vars at build time, injects into `Constants.extra` | Yes |

## What gets embedded vs runtime

**Build-time (via `app.config.ts` → `Constants.extra`):**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `R2_CDN_BASE_URL`
- `DEBUG_MODE`
- `APP_NAME`, `APP_VERSION`, `APP_BUNDLE_ID`

**Runtime secrets (via `SecureStorage`):**
- `MODEL_CDN_SIGNING_KEY` — stored in device Keychain/Keystore, loaded on demand

## Reading config in the app

```ts
import Constants from 'expo-constants';
import { SecureStorage } from '@tutor-sg/shared';

// Read build-time config
const config = Constants.expoConfig?.extra as AppConfig;
console.log(config.supabaseUrl);

// Read runtime secret
const signingKey = await SecureStorage.getModelCdnSigningKey();
```

## Model CDN signing key flow

1. On first launch, the app receives `MODEL_CDN_SIGNING_KEY` from your auth/backend flow
2. Call `SecureStorage.setModelCdnSigningKey(key)` to store it
3. The model downloader calls `SecureStorage.getModelCdnSigningKey()` when building signed URLs
4. Key lives in device Keychain (iOS) / Keystore (Android) — never leaves device

## Local dev

```bash
# Start Expo with env vars loaded from .env.local
npx expo start

# Or explicitly pass a file
npx expo start --local-vars --env-file .env.local
```

## Production

Production env vars are set in EAS Build secrets, not in `.env.production`. See the EAS Build docs for managing secrets across builds.