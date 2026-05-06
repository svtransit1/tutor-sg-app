# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

- [Architecture](docs/ARCHITECTURE.md)
- [App Design Document (Obsidian)](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
- [Locked decisions](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)

Do not commit secrets, child data, or model weights. See `.gitignore`.

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

---

## pnpm workspaces (installing from root only)

This repo uses **pnpm workspaces** to manage the multi-package monorepo.

| Package         | Path                | `name`             |
|-----------------|---------------------|--------------------|
| Mobile app      | `mobile/`            | `tutor-sg-mobile`  |
| Shared library  | `packages/shared/`   | `@tutor-sg/shared` |

**Rule:** Always run `pnpm install` (or `pnpm install --frozen-lockfile`) from the **repo root**.

```bash
# ✅ Correct — from repo root
cd /path/to/tutor-sg-app
pnpm install

# ❌ Wrong — never from inside a sub-package
cd mobile && pnpm install    # breaks the lockfile
cd packages/shared && pnpm install   # breaks the lockfile
```

Why:
- Only the root `pnpm-lock.yaml` is authoritative.
- Installing from inside a sub-package generates a stray `package-lock.json` / `pnpm-lock.yaml` and may resolve differently.
- CI uses `pnpm install --frozen-lockfile` — any drift fails the build.

If you accidentally ran `npm install` or `pnpm install` inside a sub-package, delete the stray lockfile and reinstall from root:

```bash
# Clean up stray lockfiles
find . -name 'package-lock.json' -not -path './node_modules/*' -delete

# Reinstall from root
cd /path/to/tutor-sg-app
pnpm install
```

### Lockfile guard

Every CI run includes a `lockfile-guard` job that:
1. Runs `pnpm install --frozen-lockfile`.
2. Checks `git diff --exit-code pnpm-lock.yaml`.

If the lockfile drifts from `package.json` changes, the build fails immediately.

---

## Local dev runbook

Target: **clean Mac → dev server in under 5 minutes.**

### Prerequisites

| Tool           | Version                   | Install                                                              |
| -------------- | ------------------------- | -------------------------------------------------------------------- |
| Node.js        | ≥ 20 LTS                  | `brew install node@20` or [nodejs.org](https://nodejs.org)           |
| pnpm           | ≥ 9 (managed by corepack) | bundled with Node — no separate install needed                       |
| watchman       | latest                    | `brew install watchman` (recommended for RN file watching)           |
| Xcode CLI      | ≥ 16                      | `xcode-select --install`                                             |
| Android Studio | Ladybug (2024.2+)         | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK            | 17                        | bundled with Android Studio, or `brew install openjdk@17`            |

### Quick start

```bash
git clone git@github.com:aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app
./scripts/bootstrap.sh
```

### Run mobile (Expo)

```bash
pnpm --filter mobile start        # Expo dev server — scan QR with Expo Go, or press i/a
pnpm --filter mobile ios          # iOS simulator
pnpm --filter mobile android      # Android emulator
```

### Run web (parent dashboard)

```bash
pnpm --filter web dev             # http://localhost:3000
```

### Before pushing

```bash
pnpm typecheck && pnpm lint && pnpm test
```

## E2E tests (Maestro)

```bash
# 1. Install Maestro CLI (one-time)
curl -Ls "https://get.maestro.mobile.dev" | bash

# 2. Build the dev client for the target platform
pnpm mobile ios    # or: pnpm mobile android

# 3. Run the smoke test
pnpm mobile e2e:smoke

# 4. Run all E2E flows
pnpm mobile e2e

# 5. Run the full fresh-install → first-feedback flow with timing
pnpm mobile e2e:full
```

The smoke test verifies: app launches → home screen renders → bilingual (EN/zh-Hans) subject labels are visible.

The full flow (`onboarding-to-feedback`) exercises: first launch → language pick → parent gate → PIN setup → grade/subject pick → model download → ready landing → camera capture → homework feedback. **Timing per step is captured; total must complete under 120 seconds on a mid-tier emulator.**

**CI status:** The `e2e-maestro` job runs on PR for both iOS simulator and Android emulator. Timing reports are uploaded as CI artifacts.

- [E2E framework ADR](docs/adr/001-e2e-framework.md)
- [Maestro flows](mobile/.maestro/flows/)

### Project layout

```
tutor-sg-app/
├── mobile/          # React Native + Expo app (main deliverable)
├── web/             # Next.js parent dashboard (stub, full build M6)
├── packages/shared/ # Shared types, i18n keys, syllabus schemas
├── data/            # Static content packs
├── schema/          # Content pack JSON schemas
└── scripts/         # bootstrap.sh, content generation
```

---

## EAS Build profiles

| Profile | Distribution | Use case |
|---------|-------------|----------|
| `development` | internal | Dev client with Expo Dev Tools |
| `internal` | internal | Ad-hoc / TestFlight-precursor builds (no simulator) |
| `preview` | internal | Pre-release builds for QA |
| `production` | store | App Store / Play Store submission |

Bundle ID: `com.aaas.tutorsg` (iOS) / `com.aaas.tutorsg` (Android) — defined in `mobile/app.json`.

### iOS internal build

```bash
pnpm --filter mobile eas:build:ios:internal
```

**Apple Account dependency:** `eas build --platform ios` requires a configured Apple Developer Program account (`eas credentials`) before it can produce a signed `.ipa`. Until an Apple Developer account is provisioned, the command will prompt for credentials. See AAAS-25 (boss-needed) for Apple account setup.

---

## Troubleshooting (Mac M1/M2/M3)

### `env: node: Bad CPU type` or architecture mismatch

Your shell is running under Rosetta. Ensure you're in a native arm64 terminal:

```bash
uname -m          # should print arm64
arch              # should print arm64
```

If not, right-click Terminal.app → Get Info → uncheck "Open using Rosetta".

### `gem': mach-o, but wrong architecture`

Ruby gems compiled for x86-64 won't run natively. Check `which ruby` — prefer the system Ruby (`/usr/bin/ruby`) or a Homebrew arm64 Ruby. Avoid the `/usr/local` prefix which is Rosetta-only.

### Cocoapods installs fail (`ffi` gem or `mach-o` errors)

```bash
sudo gem uninstall cocoapods
brew install cocoapods
```

Homebrew's arm64 cocoapods avoids the ffi architecture trap.

### `Podfile` out of date after `pnpm install`

```bash
cd mobile/ios
pod install --repo-update
```

Run this whenever `node_modules` changes after a fresh `pnpm install`.

### `expo: command not found`

The bootstrap script should catch this, but if you skipped it:

```bash
corepack enable
pnpm install
```

### Android emulator doesn't start

Check that `$ANDROID_HOME` and `$JAVA_HOME` are set:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
```

Add these to `~/.zshrc`.

### `Flipper` or `hermes-engine` build failures

We use Hermes (Expo default) and do not use Flipper. If you see Flipper-related errors, check that `mobile/ios/Podfile` does not reference Flipper — it should not after `expo prebuild --clean`.

### Watchman watches exhausted

```
echo 999999 | sudo tee -a /proc/sys/fs/inotify/max_user_watches  # Linux
```

On macOS Watchman manages this automatically, but if you see "too many open files":

```bash
ulimit -n 8192
```

### Slow first `pnpm install`

On Apple Silicon, native arm64 Node and pnpm are fast. If installs are slow, check:

```bash
node -p "process.arch"   # should print arm64
which node               # should be under /opt/homebrew, not /usr/local
```
