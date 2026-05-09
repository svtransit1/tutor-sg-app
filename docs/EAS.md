# EAS Build & Submit Guide

## Setup (one-time)

```sh
# 1. Install EAS CLI (if not already)
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. From mobile/ directory, create the EAS project
cd mobile
eas init                        # links this repo to an EAS project
eas project:init                # writes EAS project ID into app.json

# 4. Set build secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "<url>"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<key>"
eas secret:create --scope project --name EXPO_PUBLIC_EAS_PROJECT_ID --value "<id>"
```

## Build commands

| Profile | Command | Output |
|---|---|---|
| **Development** | `pnpm eas:build:dev` | iOS simulator AP + Android debug APK |
| **Development (iOS)** | `pnpm eas:build:dev:ios` | iOS simulator build |
| **Development (Android)** | `pnpm eas:build:dev:android` | Android debug APK |
| **Preview** | `pnpm eas:build:preview` | iOS TestFlight IPA + Android APK |
| **Preview (AAB)** | `pnpm eas:build:preview:aab` | Android AAB (Play Console internal) |
| **Production** | `pnpm eas:build:production` | App Store IPA + Play Store AAB |
| **Submit** | `pnpm eas:submit:production` | Submit to both stores |

All commands run non-interactively. Run from the repo root (pnpm workspace commands) or from `mobile/` directly.

## Profile details

### `development`
- iOS Simulator build + Android debug APK
- Bundle ID: `com.aaas.tutorsg.development`
- Display name: `tutor-sg (development)`
- No code signing required for simulator
- Channel: `development`

### `preview`
- iOS: TestFlight-ready IPA (distribution: internal)
- Android: signed APK for Play Console internal testing
- Bundle ID: `com.aaas.tutorsg.preview`
- Display name: `tutor-sg (preview)`
- EAS manages signing credentials
- Channel: `preview`

### `preview-aab`
- Android-only: Play Console AAB for internal track
- Same variant configuration as `preview`

### `production`
- iOS: App Store IPA
- Android: Play Store AAB
- Bundle ID: `com.aaas.tutorsg`
- Display name: `tutor-sg`
- EAS manages production signing credentials
- Channel: `production`

## Environment variables by profile

| Variable | `development` | `preview` | `production` |
|---|---|---|---|
| `APP_VARIANT` | `development` | `preview` | `production` |
| `EXPO_PUBLIC_APP_ENV` | `development` | `staging` | `production` |

Secrets (Supabase URL, anon key, EAS project ID) are injected via `eas secret:create` and shared across profiles in the same EAS project.

## Credential management

- **iOS**: EAS manages distribution certificates and provisioning profiles
- **Android**: EAS manages the upload keystore (see [keystore strategy](docs/decisions/2026-05-09-android-keystore-strategy.md))
- First build auto-creates credentials; subsequent builds reuse them

## CI integration (GitHub Actions)

See ADD §11 for CI conventions. Typical workflow:

```yaml
# .github/workflows/build.yml (example)
name: EAS Build
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: expo/expo-github-action@v8
      - run: pnpm install
      - run: cd mobile && eas build --profile ${{ inputs.profile }} --non-interactive
```

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `EAS project not found` | `eas init` not run | Run `eas init` in `mobile/` |
| `Credentials not found` | First build for this profile | EAS auto-creates on first build |
| `Bundle ID mismatch` | `app.json` / `app.config.ts` changed | Verify variant config |
| Build fails at `pod install` | iOS dependency issue | Run `cd ios && pod install` locally first |
