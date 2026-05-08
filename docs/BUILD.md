# EAS Development Build — Reproduction Steps

## Prerequisites

| Item | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 LTS | `brew install node@20` |
| pnpm | ≥ 9 | bundled with Node via corepack |
| EAS CLI | ≥ 16 | `npm install -g eas-cli` |
| Xcode | ≥ 16 | App Store or `xcode-select --install` |
| iOS Simulator runtime | iOS 18+ | Xcode → Settings → Platforms → install Simulator |
| Android Studio | Ladybug+ | [developer.android.com/studio](https://developer.android.com/studio) |
| Android SDK | API 34+ | Android Studio → SDK Manager |
| Android AVD | Pixel 7, API 34 | Android Studio → Device Manager |

### Install EAS CLI

```bash
npm install -g eas-cli
eas --version  # verify ≥ 16
```

### iOS Simulator (one-time)

1. Open Xcode → Settings (Cmd+,) → Platforms → click `+` next to iOS Simulator
2. Select iOS 18.0+ runtime, download (~6 GB)
3. Create a simulator: Xcode → Open Developer Tool → Simulator → File → New Simulator
4. Choose iPhone 15, iOS 18+

Or via CLI:

```bash
# List available runtimes
xcrun simctl runtime list

# Create simulator once a runtime is installed
xcrun simctl create "iPhone 15" "iPhone 15" iOS18.0
```

### Android emulator (one-time)

1. Open Android Studio → More Actions → SDK Manager
2. SDK Platforms tab → check Android 14.0 (API 34) → Apply
3. SDK Tools tab → check Android Emulator → Apply
4. Device Manager → Create Device → Pixel 7 → API 34 → Finish

## Expo Account Setup (one-time)

EAS cloud builds require an Expo account. This is owned by Boss.

```bash
# Option 1: Interactive login
eas login

# Option 2: CI/headless — set EXPO_TOKEN
export EXPO_TOKEN=<your-expo-token>
```

If you don't have credentials, create an account at [expo.dev](https://expo.dev).

## EAS Project Initialization (one-time)

```bash
cd mobile

# Creates the Expo project on EAS servers
eas init --id tutor-sg

# Links the project
eas project:init
```

## Run the Development Build

### iOS (Simulator)

```bash
cd mobile

# Cloud build (requires EAS login)
eas build --platform ios --profile development --non-interactive

# Local build (requires Xcode + simulator runtime, no EAS needed)
npx expo run:ios
```

The cloud build produces an `.app` bundle on EAS servers. Download it and drag into the Simulator window.

The local build (`npx expo run:ios`) compiles and installs directly into the default booted simulator.

### Android (Emulator)

```bash
cd mobile

# Cloud build (requires EAS login)
eas build --platform android --profile development --non-interactive

# Local build (requires Android SDK + emulator)
npx expo run:android
```

## Verify

After the build installs on the simulator/emulator:

1. App launches and shows the placeholder home screen
2. Title "Tutor SG" is visible
3. Subtitle "Your AI learning companion" is visible
4. Theme adapts to system light/dark mode

## Smoke Test

```bash
# Start the Expo dev server
pnpm --filter mobile start

# Press 'i' for iOS simulator, 'a' for Android emulator
# Or run prebuilt binary:
pnpm --filter mobile ios
pnpm --filter mobile android
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Not logged in` | No Expo session | `eas login` or set `EXPO_TOKEN` |
| `No EAS project configured` | Not initialized | `eas init` in mobile/ |
| `Could not find simulator runtime` | No iOS runtime | Install via Xcode Settings → Platforms |
| `adb: command not found` | Android SDK not in PATH | `export ANDROID_HOME=$HOME/Library/Android/sdk` |
| `Build failed: incompatible SDK` | RN version too old for Xcode | Upgrade RN or use EAS cloud (handles SDK) |
| `react-native-worklets peer dep` | Warning only, non-blocking | Ignore — transitive dep from expo-router |

## CI / Automation

For CI pipelines, use:

```bash
export EXPO_TOKEN=<ci-token>
eas build --platform all --profile development --non-interactive --wait
```

Add `--wait` to block until the build completes and download the artifact.

## Current Status (AAAS-161)

| Platform | Build Type | Status | Blockers |
|----------|-----------|--------|----------|
| iOS | EAS cloud | Blocked | No Expo account credentials; no iOS 18 simulator runtime installed |
| iOS | Local (`expo run:ios`) | Blocked | No iOS 18+ simulator runtime installed |
| Android | EAS cloud | Blocked | No Expo account credentials |
| Android | Local (`expo run:android`) | Blocked | Android SDK + emulator not installed |
