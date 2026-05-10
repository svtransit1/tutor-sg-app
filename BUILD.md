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
pnpm install
cd mobile
npx expo run:android   # Android
npx expo run:ios       # iOS
```

## Google Services (Firebase)

For Android: place `google-services.json` in `mobile/`.
For iOS: place `GoogleService-Info.plist` in `mobile/`.

These files are **not required** for local development builds. The build
config skips them when absent. Required for push notifications and
Firebase Analytics (production only).

## Known warnings (non-blocking)

- `react-native@0.81.0` vs recommended `0.81.5` — Expo SDK 54 resolves to
  0.81.0 at prebuild time. Does not affect build output.
- Gradle deprecation warnings for Gradle 9.0 from Expo/RN tooling.
- Kotlin `ReactNativeHost` deprecation from `expo` package.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `google-services.json` not found | Add via EAS secrets or skip if unused |
| `assets/adaptive-icon.png` missing | Regenerate via Python snippet |
| Metro bundler resolution errors | `npx expo start --clear` |
