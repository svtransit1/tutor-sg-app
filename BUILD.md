# Build Guide — tutor-sg

## Platform prerequisites

### Android

| Requirement | Version |
|-------------|---------|
| Node.js | >= 25.9.0 |
| pnpm | >= 10.33.0 |
| Java / JDK | 17+ |
| Android SDK (build-tools) | 36.0.0 |
| Android SDK (platform) | 36 |
| NDK | 27.1.12297006 |
| Kotlin | 2.1.20 |

**Environment:**

- `ANDROID_HOME` must point to the Android SDK root.
- Accept SDK licenses: `sdkmanager --licenses`
- Android emulator or physical device connected for `run:android`.

### iOS

| Requirement | Version |
|-------------|---------|
| Node.js | >= 25.9.0 |
| pnpm | >= 10.33.0 |
| Xcode | 16+ |
| CocoaPods | >= 1.16 |

## Development build steps

```bash
# Install dependencies
pnpm install

# Android
cd mobile
npx expo run:android

# iOS
cd mobile
npx expo run:ios
```

## Environment variables

Copy `.env.example` to `.env` and fill in required values.
See `.env.example` for the full list.

## Google Services (Firebase)

For Android: place `google-services.json` in `mobile/`.
For iOS: place `GoogleService-Info.plist` in `mobile/`.

These files are **not required** for local development builds. The build
config skips them when absent. They are required for push notifications and
Firebase Analytics (production only).

`google-services*.json` and `GoogleService-Info*.plist` are in `.gitignore`
and must never be committed.

## Known warnings (non-blocking)

- `react-native@0.81.0` vs recommended `0.81.5` — Expo SDK 54 resolves to
  0.81.0 at prebuild time. This does not affect build output.
- Gradle deprecation warnings for Gradle 9.0 compatibility. These originate
  from Expo/React Native tooling, not application code.
- Kotlin `ReactNativeHost` deprecation warnings. From `expo` package,
  not application code.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `google-services.json` not found during EAS build | Add the file via EAS secrets or remove the Firebase plugin if unused |
| `assets/adaptive-icon.png` missing | Regenerate placeholder assets via `scripts/` or Python snippet |
| Metro bundler resolution errors | Run `npx expo start --clear` to reset Metro cache |
