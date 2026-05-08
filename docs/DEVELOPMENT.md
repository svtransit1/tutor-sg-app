# Development Setup Guide

> **Audience:** Fleet agents (Owl, Wolf, Bee, Flutter, Sage, Tortoise) onboarding to the tutor-sg codebase.
> **Last updated:** 2026-05-08

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 | Use `nvm` or `fnm` |
| pnpm | ≥ 9 | `corepack enable && corepack prepare pnpm@9 --activate` |
| Xcode | ≥ 16 | iOS development (macOS only) |
| CocoaPods | ≥ 1.16 | `sudo gem install cocoapods` |
| Android Studio | ≥ Hedgehog | Android SDK 35, cmdline-tools |
| Ruby | ≥ 3.3 | System Ruby is fine for CocoaPods |

### iOS additional

- Xcode CLI tools: `xcode-select --install`
- iOS Simulator (at least one, e.g. iPhone 16)

### Android additional

- `ANDROID_HOME` set to e.g. `~/Library/Android/sdk`
- `platform-tools`, `build-tools;35`, `platforms;android-35` installed via SDK Manager
- AVD emulator (Pixel 9 API 35 recommended) or hardware device

## 2. Clone & install

```bash
git clone git@github.com:svtransit1/tutor-sg-app.git
cd tutor-sg-app
corepack enable
pnpm install
```

This installs dependencies for all workspace packages (`mobile/`, `packages/*`, `mobile/modules/*`).

### iOS pods (one-time)

```bash
cd mobile
npx pod-install
cd ..
```

### Verify install

```bash
pnpm typecheck     # TypeScript across all packages
pnpm test          # All workspace tests
```

## 3. Project structure

```
tutor-sg-app/
├── mobile/                          # Expo app entrypoint
│   ├── app/                         # Expo Router screens
│   │   ├── _layout.tsx              # Root layout (Stack navigator)
│   │   └── (parent)/                # Parent-gated routes
│   │       ├── _layout.tsx
│   │       └── settings.tsx
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   ├── i18n/                    # App-level i18n (legacy — migrating to @tutor-sg/i18n)
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── zh-Hans.json
│   │   └── services/                # App-level services
│   ├── modules/
│   │   ├── device-tier/             # Native device-tier module (Expo Modules API)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── DeviceTierModule.ts
│   │   │   │   └── DeviceTierModule.types.ts
│   │   │   ├── ios/
│   │   │   │   ├── DeviceTierModule.swift
│   │   │   │   └── DeviceTierModule.podspec
│   │   │   └── android/
│   │   │       └── src/main/java/com/aaas/tutorsg/devicetier/
│   │   │           └── DeviceTierModule.kt
│   │   └── tutor-sg-llm-runtime/    # Native LLM runtime module (Swift/Kotlin)
│   │       └── src/
│   │           ├── TutorSgLlmRuntimeModule.swift
│   │           └── TutorSgLlmRuntimeModule.kt
│   ├── babel.config.js
│   ├── jest.config.js
│   └── app.config.ts                # Expo config (env vars, plugins)
├── packages/
│   ├── database/                    # @tutor-sg/database — SQLite schema, sessions, profiles, usage
│   │   └── src/
│   │       ├── index.ts
│   │       ├── schema.ts
│   │       ├── sessions.ts
│   │       ├── profiles.ts
│   │       ├── syllabus.ts
│   │       ├── usage-counters.ts
│   │       └── types.ts
│   ├── device-tier/                 # @tutor-sg/device-tier — RAM/NPU detection + persistence
│   │   └── src/
│   │       ├── index.ts             # assignTier, buildCapabilities, detectNativeDeviceInfo
│   │       ├── types.ts             # DeviceTier, thresholds, chipset list, MODEL_MAP
│   │       ├── persistence.ts       # SQLite read/write for saved tier
│   │       ├── components/BelowFloorModal.tsx
│   │       └── __tests__/           # Jest tests
│   ├── features/                    # @tutor-sg/features — feature gates & entitlements
│   │   └── src/index.ts
│   ├── i18n/                        # @tutor-sg/i18n — shared i18n package
│   │   └── src/
│   │       ├── i18n.ts              # i18next init, locale detection, persist
│   │       ├── LanguageProvider.tsx  # React provider
│   │       ├── useLanguage.ts       # React hook
│   │       └── locales/{en,zh-Hans}/*.json
│   ├── llm/                         # @tutor-sg/llm — inference bridge, prompt builder
│   │   └── src/
│   │       ├── index.ts
│   │       ├── inference-bridge.ts
│   │       ├── prompt-builder.ts
│   │       ├── response-parser.ts
│   │       └── types.ts
│   ├── perf/                        # @tutor-sg/perf — performance monitoring
│   │   └── src/index.ts
│   └── shared/                      # @tutor-sg/shared — types, config, i18n keys
│       └── src/
│           ├── index.ts
│           ├── config/env.ts        # Zod-validated env config
│           ├── schema/registry.ts   # Model registry types
│           ├── i18n/keys.ts         # Typed i18n key registry
│           └── models/
│               ├── integrity.json   # SHA-256 manifest for model files
│               └── integrity.ts
├── data/                            # Static data
│   ├── question-bank.json
│   └── taxonomy.json
├── schema/                          # JSON schemas
├── scripts/                         # Tooling
│   ├── compute-model-hashes.ts
│   └── generate_content_pack.py
├── docs/
│   ├── ARCHITECTURE.md              # Architecture doc (source of truth)
│   ├── GOVERNANCE.md                # Agent fleet, review rules, branch protection
│   ├── DEVELOPMENT.md               # ← you are here
│   └── reviews/                     # Review records
├── tsconfig.base.json               # Shared TS config
├── pnpm-workspace.yaml
└── package.json
```

## 4. Running on iOS

```bash
cd mobile
pnpm ios
```

This runs Expo dev client on the default iOS Simulator.

Requires Xcode ≥ 16 and at least one iOS Simulator installed (e.g. iPhone 16).

## 5. Running on Android

```bash
cd mobile
pnpm android
```

Ensure an AVD is running first (Pixel 9 API 35 recommended).

### Dev server only (no simulator)

```bash
cd mobile
pnpm start
```

Press `i` for iOS or `a` for Android in the terminal.

## 6. Running tests

```bash
pnpm test          # All workspace tests
pnpm typecheck     # TypeScript across all packages
pnpm lint          # ESLint across all packages
pnpm format:check  # Prettier formatting check
pnpm format:write  # Fix Prettier formatting

# Per-package (faster when iterating)
pnpm --filter @tutor-sg/device-tier test
pnpm --filter @tutor-sg/device-tier typecheck

# Mobile-specific
pnpm --filter tutor-sg-mobile test
pnpm --filter tutor-sg-mobile e2e:smoke   # Maestro (requires app build)
```

## 7. Linting

```bash
pnpm lint                    # All packages
pnpm format:check            # Prettier
pnpm format:write            # Fix Prettier
```

## 8. Typechecking

```bash
pnpm typecheck               # All packages
pnpm --filter @tutor-sg/device-tier typecheck   # Single package
```

## 9. Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | `development` / `staging` / `production` |
| `ENABLE_DEV_TOOLS` | `false` | Show dev tools in app |
| `CDN_BASE_URL` | `https://cdn.example.com/models/` | Model file CDN |
| `SUPABASE_URL` | `https://placeholder.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `placeholder-anon-key` | Supabase anonymous key |
| `HITPAY_API_KEY` | `placeholder-hitpay-public-key` | HitPay public key |

Set via `.env` file in the repo root:

```
APP_ENV=development
ENABLE_DEV_TOOLS=true
```

Public vars (`EXPO_PUBLIC_*`) are bundled into the binary. Secret vars are never committed — they live in EAS/CI secrets.

## 10. Git conventions

- `main` is protected. No direct pushes.
- Feature branches: `feat/<short-name>`
- Bugfix branches: `fix/<short-name>`
- Commit prefix: `[agent-tag] Issue-ID: message`
  - Example: `[bee] AAAS-275: M2-20c — Settings UI quality slider`

Agent tags: `[owl]`, `[wolf]`, `[bee]`, `[foxy]`, `[flutter]`, `[sage]`, `[tortoise]`.

### Before creating a PR

1. Run `pnpm typecheck && pnpm test` — both must pass.
2. Run `pnpm format:check` — must pass (or run `pnpm format:write`).
3. Check branch hygiene: no secrets, no `node_modules`, no model files, no `.env`.
4. Push to origin and create a PR against `main`.

## 11. Native modules

### Device tier module

Located at `mobile/modules/device-tier/`. Uses the Expo Modules API pattern.

```
mobile/modules/device-tier/
├── src/
│   ├── index.ts                    # Re-exports
│   ├── DeviceTierModule.ts         # TS bridge
│   └── DeviceTierModule.types.ts   # Type definitions
├── ios/
│   ├── DeviceTierModule.swift      # iOS native implementation
│   └── DeviceTierModule.podspec    # CocoaPods spec
└── android/
    └── src/main/java/com/aaas/tutorsg/devicetier/
        └── DeviceTierModule.kt     # Android native implementation
```

The `@tutor-sg/device-tier` package wraps this module with JS fallback for platforms without the native module.

### LLM runtime module

Located at `mobile/modules/tutor-sg-llm-runtime/`. Native module for on-device LLM inference.

```
mobile/modules/tutor-sg-llm-runtime/
└── src/
    ├── TutorSgLlmRuntimeModule.swift  # iOS inference runtime
    └── TutorSgLlmRuntimeModule.kt     # Android inference runtime
```

### Adding a new native module

```bash
cd mobile
npx expo modules create my-new-module
```

This generates the template with Expo Modules API structure (`.podspec` for iOS, Kotlin for Android, TS bridge). Register the module in the Expo config if needed.

## 12. i18n workflow

Two i18n systems coexist during migration:

| Package | Status | Namespace strategy |
|---------|--------|-------------------|
| `mobile/src/i18n/` | Legacy (stable) | Single `translation` namespace, flat key `keySeparator: false` |
| `packages/i18n/` | In-use | Multi-namespace (`common`, `onboarding`, `camera`), nested JSON |

### Adding a new string

1. Add the key to `packages/shared/src/i18n/keys.ts` (the `I18nKey` union).
2. Add translations in both `en.json` and `zh-Hans.json` in the legacy location.
3. Add translations in both `packages/i18n/src/locales/{en,zh-Hans}/` namespaces.
4. Use in code: `t('my.new.key')` (legacy) or from `useLanguage().t('my.new.key')` (shared).

**Hard rule:** Every user-facing string MUST have both English and Simplified Chinese (`zh-Hans`) translations. No partial locales.

## 13. On-device LLM model files

Model files are **never bundled** in the app package (app stays <50 MB). They are downloaded on first launch from Cloudflare R2 CDN.

- Integrity manifest: `packages/shared/src/models/integrity.json`
- Hash computation: `scripts/compute-model-hashes.ts`

During development, the app uses placeholder hashes (all-zero). The download verifier skips hash checks in dev/staging builds.

## 14. Common issues

| Symptom | Fix |
|---------|-----|
| `pod install` fails | `brew install cocoapods` or `sudo gem install cocoapods` |
| `pnpm typecheck` fails in packages | Ensure you ran `pnpm install` from root (workspace dependencies) |
| iOS simulator crashes on launch | `cd mobile && npx pod-install` then rebuild |
| Native module not found | Verify the module's `.podspec` or Expo config is registered |
| `ts-jest` config errors | Run `pnpm install` again (jest deps are hoisted to root `node_modules`) |
| `expo start` hangs | Delete `mobile/node_modules` and `pnpm install` again |
| `Cannot find module 'expo-sqlite'` in tests | Mock is at `packages/device-tier/__mocks__/expo-sqlite.ts` — verify jest config includes `moduleNameMapper` |
| `pnpm test` fails with `@types/jest` error | Ensure `@types/jest` is in the package's `tsconfig.json` types array |

## 15. Further reading

- [Architecture doc](./ARCHITECTURE.md) — system topology, stack, data flow, security
- [Governance doc](./GOVERNANCE.md) — agent roles, review rules, escalation path
- Locked decisions — see [wiki/decisions-locked.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md) (Obsidian) for Boss-locked product decisions
- App Design Document — see [wiki/app-design-document.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) (Obsidian) for the authoritative product spec
