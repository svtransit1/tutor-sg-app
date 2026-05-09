# EAS Build Profile Configuration

**Date:** 2026-05-09
**Issue:** [AAAS-971](/AAAS/issues/AAAS-971) (M0-87)
**Status:** locked

## Profiles

| Profile | Variant | Distribution | iOS build | Android build | Use case |
|---|---|---|---|---|---|
| `development` | `development` | internal (dev client) | simulator build | debug APK | Local dev on simulator/device |
| `preview` | `preview` | internal | TestFlight IPA | internal APK | Internal testing (TestFlight / Play Console internal) |
| `preview-aab` | `preview` | internal | — | internal AAB | Play Console internal track (bundle) |
| `production` | `production` | store | App Store IPA | Play Store AAB | Public release |

## Dynamic app config (`app.config.ts`)

The app name and bundle identifier/package name are derived from `APP_VARIANT`:

| Variant | Display name | iOS bundle ID | Android package |
|---|---|---|---|
| `development` | `tutor-sg (development)` | `com.aaas.tutorsg.development` | `com.aaas.tutorsg.development` |
| `preview` | `tutor-sg (preview)` | `com.aaas.tutorsg.preview` | `com.aaas.tutorsg.preview` |
| `production` | `tutor-sg` | `com.aaas.tutorsg` | `com.aaas.tutorsg` |

## Google Services files (Firebase)

Firebase/Google services files are loaded per variant so each environment can have its own Firebase project:
- `production` → `GoogleService-Info.plist` / `google-services.json`
- `preview` → `GoogleService-Info-preview.plist` / `google-services-preview.json`
- `development` → `GoogleService-Info-development.plist` / `google-services-development.json`

## Channels (EAS Update Over-the-Air)

| Profile | Channel | Purpose |
|---|---|---|
| `development` | `development` | Local dev pushes |
| `preview` | `preview` | Internal testers receive OTA updates |
| `production` | `production` | Production OTA updates |

## Environment variables

Each profile injects `APP_VARIANT` and `EXPO_PUBLIC_APP_ENV`. Secrets (Supabase URL/anon key, EAS project ID) are provided via:
- Local development: `.env.local` (gitignored)
- EAS builds: `eas secret:create` or EAS project env variables
- CI: GitHub Actions secrets

## Version management

- `appVersionSource: "remote"` — version bumps managed via EAS remote config
- `autoIncrement: true` on preview and production — auto-increments build number on each build
- Development builds skip auto-increment (local-only, ephemeral)

## Build commands

```sh
# Development (local simulator/device)
pnpm eas:build:dev              # all platforms
pnpm eas:build:dev:ios          # iOS only
pnpm eas:build:dev:android      # Android only

# Preview (internal testing)
pnpm eas:build:preview          # iOS IPA + Android APK
pnpm eas:build:preview:aab      # Android AAB for Play Console

# Production (App Store / Play Store)
pnpm eas:build:production

# Submit to stores
pnpm eas:submit:production
```

## CI integration (ADD §11 reference)

GitHub Actions workflows use these profiles:
- **PR checks**: typecheck + test (no EAS build)
- **Merge to main**: automated preview build via `pnpm eas:build:preview`
- **Tagged release**: automated production build via `pnpm eas:build:production`
- **Manual trigger**: any profile via workflow_dispatch

CI must have `EAS_BUILD_PROFILE` set to match the target profile. Secrets are injected via GitHub Actions → EAS (never hardcoded in CI config).

## EAS project setup (prerequisite)

Before first build, run from `mobile/`:
```sh
eas init                      # creates EAS project linked to this repo
eas project:init              # configures app.json with EAS project ID
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <url>
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>
```

## References

- [Expo docs: EAS Build profiles](https://docs.expo.dev/build/eas-json/)
- [Expo docs: app config with TypeScript](https://docs.expo.dev/workflow/configuration/#app-config-typescript)
- [EAS managed keystore strategy](2026-05-09-android-keystore-strategy.md)
- ADD §11: Development conventions (CI)
