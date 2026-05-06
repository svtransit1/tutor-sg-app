# Decision: EAS Submit Configuration — iOS App Store + Google Play

**Date:** 2026-05-07
**Issue:** AAAS-133 (M0-17)
**Author:** 🐝 Bee (Mobile Coder #2)
**Status:** Locked

## Context

We need to configure Expo Application Services (EAS) Submit for the tutor-sg mobile app to enable submission to both the Apple App Store and Google Play Store. This builds on the existing EAS Build configuration (AAAS-23) which set up build profiles for internal testing.

## Decision

### 1. `eas.json` — Submit Profiles

Two submit profiles created in `mobile/eas.json`:

**`production` profile**
- Targets App Store (iOS) and Google Play `production` track (Android)
- iOS submits via Apple ID credentials (`appleId` + app-specific password)
- Android submits via service account JSON key to the `production` track with `releaseStatus: "completed"`
- Both platforms use `@EAS_*` secret references — credentials are never hardcoded

**`beta` profile**
- iOS submits to TestFlight (Apple's beta track)
- Android submits to `internal` track (Google Play Internal Testing)
- Same credential mechanism as production, just a different target track

### 2. Credential Strategy

Credentials are injected via EAS Secrets (`eas secret:create`) or environment variables — never committed to the repo. The `.env.example` file documents which secrets are needed:

| Secret | Source | Purpose |
|---|---|---|
| `EAS_PROJECT_ID` | `eas project:init` | EAS project identity |
| `EAS_APPLE_ID` | Apple ID email | App Store Connect login |
| `EAS_APPLE_APP_SPECIFIC_PASSWORD` | appleid.apple.com → App-Specific Passwords | 2FA bypass for upload |
| `EAS_APPLE_TEAM_ID` | developer.apple.com → Membership | Apple Developer Team |
| `ASC_APPLE_ID` | App Store Connect → My App → App Info | Numeric App Store ID |
| `EAS_ANDROID_SERVICE_ACCOUNT_KEY_PATH` | Google Play Console → API access | Play Console auth |

**Future improvement:** Switch to App Store Connect API Key (ASC API Key) for CI — this removes the dependency on `appleId` + app-specific passwords and is more secure for automated pipelines. Documented as comments in `.env.example`.

### 3. Build Profiles Updated

The existing `production` build profile was updated to use `distribution: "store"` and `autoIncrement: true` so EAS Build produces store-ready artifacts with automatic version bumping.

### 4. Scripts Added

The `mobile/package.json` now includes:
- `eas:submit:ios` — submit iOS build to App Store
- `eas:submit:android` — submit Android build to Play Store
- `eas:submit:all` — submit both
- `eas:submit:ios:beta` — submit iOS to TestFlight
- `eas:submit:android:beta` — submit Android to internal testing

### 5. app.json Updated

Added `extra.eas.projectId` reference using environment variable substitution (`${EAS_PROJECT_ID}`). This allows the project ID to be set per-environment.

## Alternatives Considered

- **Hardcoding credentials in eas.json** — Rejected. Credentials are secrets; must never be in the repo.
- **Using ASC API Key only** — Deferred. In scope for CI integration (M7). For now, Apple ID + app-specific password is simpler for manual first submission.
- **One combined submit profile** — Rejected. We need separate beta/production tracks for testing workflows.

## References

- [EAS Submit documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Build profiles](https://docs.expo.dev/build/eas-json/)
- AAAS-23: EAS Build profile — iOS internal (earlier milestone)
- `.env.example` — credential template at repo root
- `mobile/eas.json` — actual configuration
