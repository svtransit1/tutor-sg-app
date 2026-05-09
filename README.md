# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [App Design Document](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/docs/ARCHITECTURE.md) (repo copy) ←→ [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) (Obsidian source of truth)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Governance:** [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md)
**Review protocol:** [`docs/FLEET_REVIEW_PROTOCOL.md`](docs/FLEET_REVIEW_PROTOCOL.md)
**Framework:** React Native + Expo + TypeScript, pnpm monorepo

---

## Repository structure

```
tutor-sg-app/
├── mobile/                  # Expo / React Native app (iOS + Android)
│   ├── app/                 # Expo Router file-based routes
│   │   ├── (kid)/           #   Child-facing screens (home, camera, chat)
│   │   ├── (onboarding)/    #   First-launch flow (PIN setup)
│   │   └── (parent)/        #   Parent dashboard (PIN-gated)
│   ├── src/                 # Shared logic
│   │   ├── components/      #   Reusable UI components
│   │   ├── hooks/           #   Custom hooks (PIN gate, sessions, language)
│   │   ├── i18n/            #   Internationalisation (en, zh-Hans)
│   │   ├── models/          #   Domain types / interfaces
│   │   ├── screens/         #   Full-screen views (PIN gate, setup)
│   │   └── storage/         #   SQLite + SecureStore helpers
│   ├── modules/             #   Expo native module (device info)
│   ├── android/             #   Android native shell (Gradle)
│   ├── ios/                 #   iOS native shell (Xcode)
│   ├── app.json             #   Expo config
│   ├── eas.json             #   EAS Build profiles
│   └── metro.config.js      #   Metro bundler config (monorepo-aware)
├── packages/                # Shared pnpm workspace packages
│   ├── shared/              #   Cross-app types, model routing, integrity hashes
│   ├── device-tier/         #   RAM / NPU detection for model tier selection
│   ├── features/            #   Feature-gate definitions
│   ├── perf/                #   Performance utilities
│   └── eslint-config/       #   Shared ESLint config
├── data/                    # Question bank + taxonomy (version-controlled)
│   ├── question-bank.json
│   └── taxonomy.json
├── schema/                  # JSON Schema for data validation
│   └── question-bank-schema.json
├── scripts/                 # Dev tooling (model hash computation, content gen)
├── run/                     # Husky v9 runtime helpers (git hooks)
├── syllabus-pdfs/           # Source MOE syllabus PDFs (extracted/)
├── docs/                    # Project documentation
│   ├── ARCHITECTURE.md      #   System architecture & data flow
│   ├── FLEET_REVIEW_PROTOCOL.md
│   ├── GOVERNANCE.md        #   Agent roles, review rules, branch protection
│   ├── decisions/           #   Locked-in decisions (dated)
│   └── reviews/             #   Review records
├── .github/                 # GitHub Actions CI + CODEOWNERS
└── pnpm-workspace.yaml      # Workspace definition (mobile + packages/*)
```

**Workspace packages** (defined in `pnpm-workspace.yaml`):

| Package | Path | Responsibility |
|---------|------|----------------|
| `tutor-sg-mobile` | `mobile/` | Expo app — routes, screens, components, i18n, storage |
| `@tutor-sg/shared` | `packages/shared/` | Shared types, schema registry, model routing table, integrity hashes |
| `@tutor-sg/device-tier` | `packages/device-tier/` | Device RAM/NPU detection, tier classification |
| `@tutor-sg/features` | `packages/features/` | Feature-gate definitions and evaluation |
| `@tutor-sg/perf` | `packages/perf/` | Performance utilities and monitoring |
| `@tutor-sg/eslint-config` | `packages/eslint-config/` | Shared ESLint configuration |

---

## Prerequisites

- **Node.js** 20.x (uses `engines` in package.json)
- **pnpm** 10.x — install via `corepack enable && corepack prepare pnpm@10.33.0 --activate`
- **Xcode** 16+ (iOS development)
- **Android Studio** (Android development)
- **Expo account** with EAS CLI configured (`npx eas login`)
- **Ruby + CocoaPods** (for iOS `pod install`)

---

## Setup

```bash
# 1. Install dependencies at repo root (installs all workspace packages)
pnpm install

# 2. Install CocoaPods for iOS (if developing on macOS)
cd mobile && npx pod-install && cd ..

# 3. Verify everything works
pnpm typecheck
pnpm test
```

> The Metro bundler config in `mobile/metro.config.js` is already monorepo-aware: it watches the repo root and resolves `node_modules` from both `mobile/` and the root.

---

## Development

```bash
# Start Expo dev server (from repo root)
pnpm mobile:start

# Launch on iOS Simulator
pnpm mobile:ios

# Launch on Android emulator
pnpm mobile:android
```

### Git hooks

Husky runs `lint-staged` on every commit. This runs ESLint + typecheck on staged files. If hooks become stale after a pnpm install change, run `pnpm prepare` (re-runs husky install).

---

## Scripts (root `package.json`)

| Command | Description |
|---------|-------------|
| `pnpm typecheck` | TypeScript check across all workspace packages |
| `pnpm test` | Run tests across all workspace packages |
| `pnpm mobile:start` | Start Expo dev server for mobile app |
| `pnpm mobile:ios` | Launch mobile on iOS Simulator |
| `pnpm mobile:android` | Launch mobile on Android emulator |
| `pnpm eas:build:android:internal` | Build Android APK via EAS for sideload |
| `pnpm eas:build:android:internal-aab` | Build Android AAB for Play Console internal track |

---

## Build & deploy

See [`mobile/eas.json`](mobile/eas.json) for build profiles.

### Android internal (APK — sideload)

```bash
pnpm eas:build:android:internal
# Download from EAS, then:
adb install path/to/tutor-sg-internal.apk
```

### Android internal (AAB — Play Console internal track)

```bash
pnpm eas:build:android:internal-aab
# Upload the .aab via Google Play Console → Internal testing
```

### iOS internal

```bash
cd mobile && eas build --platform ios --profile internal --non-interactive
```

### Keystore

- EAS manages the Android keystore automatically on first build.
- A local debug keystore is at `mobile/android/app/debug.keystore` for development builds.
- Production releases use the EAS-managed keystore.

---

## CI

GitHub Actions runs on push/PR to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

1. **Typecheck** — `pnpm typecheck` across all packages
2. **Lint** — ESLint across all packages
3. **RN Bundle** — `expo export` for both iOS and Android (dependent on typecheck + lint passing)

---

## Model integrity

Model artifacts downloaded at first launch are verified against SHA-256 checksums in `packages/shared/src/models/integrity.json`.

To refresh hashes after a model update:

```bash
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json  # overwrites integrity.json
```

See the [Architecture doc](docs/ARCHITECTURE.md#35-first-launch-model-download) for the full download + verification flow.

---

## Team & governance

| Agent | Role | Responsibility |
|-------|------|----------------|
| 🦉 Owl | CTO | Architecture decisions, framework choice, model routing |
| 🐺 Wolf | Mobile Coder | Primary implementation |
| 🦊 Foxy | PM | Product specs, merge approval |
| 🐢 Tortoise | Review Bot | Automated PR review, quality gates |
| 🐝 Bee | Cross-platform | Camera/OCR, parent log, IAP |
| 🎨 Flutter | UX | Onboarding, camera UX, homework log UI |
| 🌿 Sage | Content | Syllabus content, Chinese MT, question generation |

See [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) for full review rules, branch protection, and branch conventions.

---

## Key principles

- **All child data stays on-device.** Photos, OCR text, chat, and kid profiles never leave the device without explicit parental opt-in.
- **No remote LLM at runtime.** Inference runs entirely on-device via ExecuTorch (iOS) / LiteRT-LM (Android).
- **Bilingual by default.** Every user-facing string ships in EN + zh-Hans-SG.
- **No third-party analytics in child-facing code paths.**
- **Model files are never bundled** in the app package (app stays under 50 MB). Downloaded on first launch from Cloudflare R2 CDN.

---

## Related documents

| Document | Location |
|----------|----------|
| App Design Document (authoritative spec) | [Obsidian wiki](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Governance | [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) |
| Fleet Review Protocol | [`docs/FLEET_REVIEW_PROTOCOL.md`](docs/FLEET_REVIEW_PROTOCOL.md) |
| Locked decisions | [`docs/decisions/`](docs/decisions/) |
| GitHub Project | [Paperclip AaaS](https://paperclip.aaas.xyz) |

Do not commit secrets, child data, or model weights. See `.gitignore`.
