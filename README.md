# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

---

## Dev

### Prerequisites

- **Node.js** >= 25.9.0
- **pnpm** >= 10.33.0 (the repo uses `packageManager` pinning — run `corepack enable` if pnpm isn't auto-installed)

### Quick start (single command)

```bash
pnpm dev
```

Starts all services from a clean state:
1. Installs dependencies (idempotent — no-op if already installed)
2. Starts TypeScript type-checking in watch mode (all workspace packages)
3. Starts the Expo dev server + Metro bundler

Press `Ctrl+C` to stop all services.

### Platform-specific launch

```bash
pnpm dev:ios      # Expo + iOS Simulator
pnpm dev:android  # Expo + Android emulator
```

### First-time setup only

```bash
pnpm bootstrap    # Installs dependencies, verifies toolchain
```

### Services started by `pnpm dev`

| Service | Purpose |
|---|---|
| TypeScript watch (`tsc --noEmit --watch`) | Real-time type checking across all workspace packages |
| Expo dev server | Mobile app dev server with hot reload |
| Metro bundler | JavaScript bundler (managed by Expo) |

### Other useful commands

```bash
pnpm typecheck      # One-shot typecheck (all packages)
pnpm test           # Run all tests
pnpm lint           # Lint all packages
pnpm mobile:start   # Expo dev server only (no TypeScript watch)
```

### Environment config

1. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` — all keys are documented in `.env.example`.

3. The config module validates required vars at startup.
   See `packages/shared/src/config/env.ts` for the full Zod schema.

4. Build-time secrets are managed via EAS Secrets / GitHub Actions Secrets.
   See [`docs/SECRETS.md`](docs/SECRETS.md) for step-by-step setup.

---

## Build

### Prerequisites

- [Expo Account](https://expo.dev) with EAS CLI configured
- `pnpm install` at repo root

### Android internal build (APK — sideload)

```bash
pnpm eas:build:android:internal
```

### Android internal build (AAB — Play Console internal track)

```bash
pnpm eas:build:android:internal-aab
```

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

A local **debug keystore** lives at `mobile/android/app/debug.keystore`. Production releases use a signed keystore managed through EAS. If Play Console sign-up is not complete, file a `boss-needed` issue.

---

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
