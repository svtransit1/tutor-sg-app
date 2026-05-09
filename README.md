# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

---

## Build

### Prerequisites

- [Expo Account](https://expo.dev) with EAS CLI configured
- `pnpm install` at repo root

### Android internal build (APK — sideload)

Builds an APK for direct installation on Android devices via `adb`.

```bash
pnpm eas:build:android:internal
```

This runs `eas build --platform android --profile internal-android --non-interactive` inside `mobile/`.

Once the build completes, EAS prints a download URL. Download the `.apk` and install:

```bash
adb install path/to/tutor-sg-internal.apk
```

### Android internal build (AAB — Play Console internal track)

Builds an Android App Bundle for uploading to the Play Console internal testing track.

```bash
pnpm eas:build:android:internal-aab
```

Upload the resulting `.aab` via [Google Play Console](https://play.google.com/console) → Internal testing → Create new release.

### iOS internal build

```bash
cd mobile && eas build --platform ios --profile internal --non-interactive
```

### Build profiles

See `mobile/eas.json` for available profiles:

| Profile | Platform | Artifact | Use case |
|---|---|---|---|
| `internal-android` | Android | APK | Direct sideload via `adb` |
| `internal-android-aab` | Android | AAB | Play Console internal track |

### Keystore

During the first EAS build for Android, EAS prompts you to either:
- Let EAS manage a keystore automatically (recommended for most cases), or
- Upload your own keystore.

A local **debug keystore** lives at `mobile/android/app/debug.keystore` for development builds run outside of EAS. Production releases require a signed keystore managed through EAS.

If Play Console sign-up has not been completed yet, file a `boss-needed` issue requesting Play Console account setup.

## Model integrity hashes

The app verifies downloaded model artifacts against SHA-256 checksums in `packages/shared/src/models/integrity.json`.

### Refresh hashes (new quant or model variant)

1. Place the `.gguf` or `.mlx` files in a directory:
   ```bash
   mkdir -p /tmp/model-staging
   cp path/to/new-model.gguf /tmp/model-staging/
   ```

2. Run the hash computation script:
   ```bash
   npx tsx scripts/compute-model-hashes.ts /tmp/model-staging
   ```
   This prints a JSON manifest with `sha256` and `sizeBytes` for each file.

3. Update `packages/shared/src/models/integrity.json` — either manually or with `--json`:
   ```bash
   npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json
   ```
   This overwrites the integrity manifest. **Review the diff before committing.**

4. Commit the updated `integrity.json`. The app uses these hashes to verify downloads on first launch.

### Placeholder hashes

Until real model files are hosted on a CDN, `integrity.json` ships with all-zero `sha256` placeholders. The download verifier must treat these as "unverified" and skip hash checks in dev/staging builds.
