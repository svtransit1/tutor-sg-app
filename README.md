# tutor-sg

Singapore primary school AI tutor — on-device LLM, bilingual EN + Simplified Chinese, P1–P6, all 4 core subjects (Math, English, Chinese MT, Science).

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [App Design Document](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)
**Locked decisions:** [wiki decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)

Do not commit secrets, child data, or model weights. See `.gitignore`.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Environment Variables](#environment-variables)
- [Building with EAS](#building-with-eas)
- [Testing](#testing)
- [Model Management](#model-management)
- [Branch Conventions & CI/CD](#branch-conventions--cicd)
- [Troubleshooting](#troubleshooting)
- [Docs Reference](#docs-reference)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 20.x | Runtime |
| [pnpm](https://pnpm.io/) | 10.33.0 | Package manager (see `package.json` `packageManager` field) |
| [Xcode](https://developer.apple.com/xcode/) | 16.x | iOS development (macOS only) |
| [Xcode CLI tools](https://developer.apple.com/xcode/) | — | `xcode-select --install` |
| [Android Studio](https://developer.android.com/studio) | Latest | Android development |
| [Expo CLI](https://docs.expo.dev/) | Latest | `npm install -g eas-cli` |
| [Expo account](https://expo.dev) | — | Required for EAS builds |
| [Ruby](https://www.ruby-lang.org/) | 3.x | CocoaPods (bundled with macOS) |
| [CocoaPods](https://cocoapods.org/) | Latest | `sudo gem install cocoapods` |

### pnpm setup

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

Or install directly:

```bash
npm install -g pnpm@10.33.0
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone git@github.com:aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app

# 2. Install dependencies (from repo root)
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with real values (see docs/SECRETS.md)

# 4. Start the Metro dev server
pnpm mobile:start
```

This launches the Expo dev server. From here you can press `i` to open the iOS simulator or `a` to open the Android emulator.

**First-time Android:** Make sure you have an Android Virtual Device (AVD) running via Android Studio or use a physical device connected via USB with USB debugging enabled.

---

## Project Structure

```
tutor-sg-app/
├── mobile/                     # React Native / Expo app
│   ├── app/                    # Expo Router pages
│   │   ├── (kid)/              # Kid-facing screens (home, camera, history)
│   │   ├── (onboarding)/       # First-launch flow (welcome, sign-in, consent, PIN)
│   │   ├── (parent)/           # Parent dashboard (PIN-gated)
│   │   └── auth/               # Auth callback
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── i18n/               # i18n setup + locale JSON
│   │   ├── models/             # Domain types
│   │   ├── screens/            # Screen components (non-route)
│   │   ├── services/           # Auth, Supabase, model download, telemetry
│   │   └── storage/            # SQLite, secure store wrappers
│   ├── modules/                # Expo native modules
│   │   └── tutor-sg-device-info/  # Device RAM/NPU detection (iOS + Android)
│   ├── e2e/                    # Maestro E2E test flows
│   ├── eas.json                # EAS build profiles
│   └── app.config.ts           # Expo app config (multi-variant)
├── packages/
│   ├── device-tier/            # Device capability detection, BelowFloorModal
│   ├── features/               # Feature gate definitions
│   ├── llm/                    # LLM routing, subject classifier, prompt templates
│   └── shared/                 # Shared config (env, i18n keys), model registry, schemas
├── scripts/
│   ├── compute-model-hashes.ts # SHA-256 hash computation for model artifacts
│   └── generate_content_pack.py# Question bank generation script
├── data/
│   ├── question-bank.json      # Generated practice question bank
│   └── taxonomy.json           # Subject/topic taxonomy
├── schema/
│   └── question-bank-schema.json  # JSON Schema for question bank
├── syllabus-pdfs/extracted/    # Extracted MOE syllabus topic trees
│   ├── math_p1-p6_topics.txt
│   ├── english_p1-p6_topics.txt
│   ├── science_p1-p6_topics.txt
│   └── chinese_p1-p6_topics.txt
├── docs/                       # Project documentation
├── .github/workflows/ci.yml    # CI pipeline
├── tsconfig.base.json          # Shared TypeScript config
└── pnpm-workspace.yaml         # Workspace definition
```

### Monorepo packages

| Package | Location | Description | Status |
|---------|----------|-------------|--------|
| `@tutor-sg/device-tier` | `packages/device-tier/` | RAM + NPU detection, device tier classification | Active |
| `@tutor-sg/features` | `packages/features/` | Feature gate table (free/trial/paid) | Active |
| `@tutor-sg/llm` | `packages/llm/` | Subject classifier, model routing, prompt templates | Active |
| `@tutor-sg/shared` | `packages/shared/` | Env config, model registry, i18n keys, schemas | Active |
| `@tutor-sg/database` | `packages/database/` | SQLite schema + migrations | Placeholder |
| `@tutor-sg/i18n` | `packages/i18n/` | Shared i18n utilities | Placeholder |
| `@tutor-sg/perf` | `packages/perf/` | Performance benchmarking harness | Placeholder |
| `@tutor-sg/theme` | `packages/theme/` | Shared design tokens / theme | Placeholder |

---

## Development Commands

All commands run from the repo root unless noted.

### Local development

```bash
pnpm mobile:start              # Start Expo dev server
pnpm mobile:ios                # Start + open iOS simulator
pnpm mobile:android            # Start + open Android emulator
```

### Code quality

```bash
pnpm typecheck                 # TypeScript check (all packages + mobile)
pnpm test                      # Run all tests (packages + mobile)
pnpm --recursive lint          # ESLint across all packages
```

### Git hooks

Husky runs `lint-staged` on pre-commit, enforcing ESLint + typecheck on staged `*.{ts,tsx}` files.

---

## Environment Variables

See [docs/SECRETS.md](docs/SECRETS.md) for full documentation.

### Local setup

```bash
cp .env.example .env.local
# Edit .env.local with real values
```

### Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | — |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID | from expo.dev |

All public variables use the `EXPO_PUBLIC_` prefix. Never prefix real secrets (service keys, API secrets) with `EXPO_PUBLIC_` — doing so embeds them in the client binary.

---

## Building with EAS

Full EAS guide: [docs/EAS.md](docs/EAS.md)

### Profiles

| Profile | iOS | Android | Use case |
|---------|-----|---------|----------|
| `development` | Simulator build | Debug APK | Local dev testing |
| `preview` | TestFlight IPA | Signed APK | Internal testing |
| `preview-aab` | — | Play Console AAB | Play Console internal track |
| `production` | App Store IPA | Play Store AAB | Release |

### One-time EAS setup

```bash
npm install -g eas-cli
eas login
cd mobile
eas init                     # Link repo to EAS project
eas project:init             # Write EAS project ID to app.json
```

Set build secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "<url>"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<key>"
eas secret:create --scope project --name EXPO_PUBLIC_EAS_PROJECT_ID --value "<id>"
```

### Build commands

```bash
# Development (iOS simulator + Android debug)
pnpm eas:build:dev

# Preview (TestFlight + signed APK)
pnpm eas:build:preview

# Android AAB (Play Console internal track)
pnpm eas:build:preview:aab

# Production (App Store + Play Store)
pnpm eas:build:production

# Submit to stores
pnpm eas:submit:production
```

### Android internal build (APK — sideload)

```bash
pnpm eas:build:android:internal
```

Once the build completes, EAS prints a download URL. Download and install:

```bash
adb install path/to/tutor-sg-internal.apk
```

### Keystore

During the first EAS build for Android, EAS prompts you to either let it manage a keystore automatically (recommended) or upload your own. A local debug keystore lives at `mobile/android/app/debug.keystore` for development builds outside EAS.

---

## Testing

### Unit & integration tests

```bash
pnpm test                     # All packages + mobile
pnpm --filter @tutor-sg/shared test  # Single package
```

- **Mobile tests:** Jest + React Native Testing Library (`@testing-library/react-native`)
- **Package tests:** Jest + ts-jest, vitest (device-tier)
- **Coverage threshold:** 50–60% lines per package (see individual jest configs)

### E2E tests (Maestro)

```bash
cd mobile && maestro test e2e/
```

---

## Model Management

### Model integrity hashes

The app verifies downloaded model artifacts against SHA-256 checksums in `packages/shared/src/models/integrity.json`.

### Refresh hashes (new quant or model variant)

```bash
# 1. Stage model files
mkdir -p /tmp/model-staging
cp path/to/new-model.gguf /tmp/model-staging/

# 2. Compute hashes
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging

# 3. Update integrity.json (with --json flag)
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json
git diff packages/shared/src/models/integrity.json
```

### Placeholder hashes

Until real model files are hosted on a CDN, `integrity.json` ships with all-zero `sha256` placeholders. The download verifier treats these as "unverified" and skips hash checks in dev/staging builds.

See [docs/MODEL_DOWNLOAD.md](docs/MODEL_DOWNLOAD.md) for the full model download and integrity specification.

---

## Branch Conventions & CI/CD

### Branch naming

| Pattern | Example | Purpose |
|---------|---------|---------|
| `main` | `main` | Shippable, protected |
| `feat/<short-name>` | `feat/aaas-1148-repo-readme` | Features |
| `fix/<short-name>` | `fix/aaas-1047-missing-locale-keys` | Bugfixes |

### Commit tags

Agent-tagged commits: `[bee]`, `[wolf]`, `[owl]`, `[foxy]`, `[flutter]`, `[sage]`

### Branch protection (main)

- Requires PR review (1 approval)
- Requires CI checks (typecheck → lint → bundle)
- Requires linear history — no merge commits
- No direct pushes — PR only

See [docs/GOVERNANCE.md](docs/GOVERNANCE.md) for agent ↔ GitHub mapping and review rules.

### CI pipeline

Defined in `.github/workflows/ci.yml`. Three parallel jobs (typecheck, lint) → sequential bundle step:

```
Job: Typecheck  → pnpm typecheck
Job: Lint       → pnpm lint
  (both pass)
Job: Bundle     → npx expo export ios + android (matrix)
```

Runs on push/PR to `main`. Cancels in-progress runs for the same branch (except `main`).

Review protocol: [docs/FLEET_REVIEW_PROTOCOL.md](docs/FLEET_REVIEW_PROTOCOL.md)

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `pnpm install` fails | pnpm version mismatch | Check `packageManager` field, run `corepack enable && corepack prepare` |
| Metro can't resolve modules | Missing deps or hoisting issue | Run `pnpm install` from root; verify `pnpm-workspace.yaml` |
| iOS build fails at CocoaPods | Outdated Podfile.lock | `cd mobile/ios && pod install` |
| `EAS project not found` | `eas init` not run | Run `eas init` in `mobile/` |
| `EXPO_PUBLIC_*` values not loading | Missing `.env.local` | `cp .env.example .env.local` then fill in values |
| `tsc --noEmit` type errors | Type mismatch | Check `tsconfig.base.json` extends in each package |
| Model integrity check fails | Stale `integrity.json` | Re-run `scripts/compute-model-hashes.ts` |
| Git hooks not running | Husky not installed | `pnpm prepare` (runs `husky`) |
| Pre-commit hook fails | lint-staged / eslint error | Fix lint + typecheck issues in staged files |

---

## Docs Reference

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System topology, stack, data flow, security |
| [docs/EAS.md](docs/EAS.md) | EAS build & submit guide |
| [docs/GOVERNANCE.md](docs/GOVERNANCE.md) | Agent fleet, review rules, branch protection |
| [docs/FLEET_REVIEW_PROTOCOL.md](docs/FLEET_REVIEW_PROTOCOL.md) | Review lifecycle, quality gates, escalation |
| [docs/MODEL_DOWNLOAD.md](docs/MODEL_DOWNLOAD.md) | CDN config, integrity verification, model versioning |
| [docs/SECRETS.md](docs/SECRETS.md) | Env vars, EAS secrets, rotation policy |
| [docs/decisions/](docs/decisions/) | Locked technical decisions |
| [docs/reviews/](docs/reviews/) | Review records |
| [App Design Document](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) | Authoritative product spec |
| [Locked Decisions](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md) | Never-override decisions |
