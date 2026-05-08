# Developer Quickstart Guide — tutor-sg

> Prerequisites, local setup, and running the app for the first time.
>
> For architecture decisions see [`ARCHITECTURE.md`](ARCHITECTURE.md).
> For the full product spec see the [App Design Document](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) (ADD).

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 20 LTS | Use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| **pnpm** | 9 | `corepack enable && corepack prepare pnpm@9 --activate` |
| **Expo CLI** | latest | Installed with `pnpm install`; no global install needed |
| **Xcode** | 16+ | macOS only; includes iOS Simulator. From App Store. |
| **Android Studio** | Ladybug (2024.2+) | Includes Android Emulator, SDK 34+, Android 11+ images |
| **watchman** | (optional) | `brew install watchman` — improves file-watching on macOS |

### iOS Simulator

1. Install Xcode from the App Store.
2. Open Xcode → Settings → Platforms → download an iOS 17+ simulator runtime.
3. Verify: `open -a Simulator`

### Android Emulator

1. Install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio → More Actions → SDK Manager → SDK Platforms → install Android 14 (API 34).
3. SDK Tools tab → install **Android Emulator** and **Intel HAXM** (Intel Mac) or **Hypervisor Framework** (ARM Mac).
4. Create a virtual device: More Actions → Virtual Device Manager → Create Device → choose a Pixel phone running system image `Tiramisu` (API 33) or later, with ≥4 GB RAM.
5. Verify: launch the emulator from the Virtual Device Manager.

---

## 2. Get the code

```bash
git clone git@github.com:svtransit1/tutor-sg-app.git
cd tutor-sg-app
```

Switch to the latest `main`:

```bash
git checkout main
git pull origin main
```

Create a feature branch — never work directly on `main` (see [`GOVERNANCE.md`](GOVERNANCE.md)):

```bash
git checkout -b feat/my-feature
```

---

## 3. Install dependencies

```bash
pnpm install
```

This installs all workspace packages (`mobile/`, `packages/*`).

---

## 4. Project structure

```
tutor-sg-app/
├── mobile/                  # React Native + Expo app
│   └── src/
│       └── i18n/            # EN + zh-Hans-SG translations
├── packages/
│   ├── database/            # SQLite + sqlite-vec schema & queries
│   ├── device-tier/         # RAM/NPU detection & model routing
│   ├── features/            # Feature-gate & entitlement system
│   ├── i18n/                # Shared i18n primitives
│   ├── llm/                 # LiteRT-LM / ExecuTorch inference wrappers
│   ├── perf/                # Performance budget utilities
│   └── shared/              # Types, model integrity, shared contracts
├── schema/                  # Data schemas (question-bank, etc.)
├── scripts/                 # Build tools (model hash computation, content gen)
├── syllabus-pdfs/           # MOE syllabus source PDFs
├── data/                    # Derived content packs
├── docs/                    # Architecture, governance, this guide
│   ├── ARCHITECTURE.md
│   ├── GOVERNANCE.md
│   └── dev-guide.md
└── .github/workflows/       # CI (typecheck, lint, bundle)
```

---

## 5. Running locally

### iOS Simulator

```bash
cd mobile
pnpm run ios
```

This starts the Expo dev server and opens the app in an iOS Simulator.
Press `i` in the Expo CLI to reopen the simulator if it disconnects.

### Android Emulator

Start an Android emulator from Android Studio or CLI first:

```bash
emulator -avd Pixel_7_API_34   # replace with your AVD name
```

Then run the app:

```bash
cd mobile
pnpm run android
```

### Expo Go (quick iteration, no native modules)

For UI-only work that doesn't touch native modules (camera, LLM inference, stylus), you can use Expo Go on a physical device:

```bash
cd mobile
pnpm run start
```

Then scan the QR code with the Expo Go app (iOS/Android).

> **Note:** The full LLM inference pipeline and native camera require a dev client build (`pnpm run ios` / `pnpm run android`). Expo Go won't work for those features.

---

## 6. Tests and CI

Commands run from the repo root:

```bash
pnpm typecheck      # TypeScript type-check across all packages
pnpm lint           # ESLint + Prettier
pnpm test           # Jest unit tests across all packages
```

### What CI validates

The [`ci.yml`](.github/workflows/ci.yml) workflow runs on every PR to `main`:

1. **Typecheck** — `pnpm typecheck` (all packages, no emit)
2. **Lint** — `pnpm lint` (ESLint + Prettier)
3. **RN Bundle** — `npx expo export --platform ios` and `--platform android` (Catches bundle-time errors)

All three must pass before merge.

---

## 7. Development conventions

See [`GOVERNANCE.md`](GOVERNANCE.md) for the full rules. Quick reference:

- **Branches:** `feat/<name>`, `fix/<name>` — never commit directly to `main`.
- **Commits:** Tag with your agent name: `[owl]`, `[wolf]`, `[bee]`, `[foxy]`, `[flutter]`, `[sage]`.
- **Bilingual:** Every user-facing string must have an EN + zh-Hans-SG counterpart in `mobile/src/i18n/`.
- **Privacy:** No third-party analytics SDKs in child-facing code paths. Photos and OCR text never leave the device.
- **Dependencies:** Prefer well-maintained libraries. Document any vendored dep with license + rationale.

---

## 8. References

| Resource | Link |
|---|---|
| Architecture | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) |
| App Design Document (ADD) | [Obsidian wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) |
| Locked decisions | [Obsidian decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md) |
| Governance | [`docs/GOVERNANCE.md`](GOVERNANCE.md) |
| Model integrity | [`README.md`](../README.md) — hashes refresh flow |
| CI config | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Issue tracker | Paperclip (AaaS company, id `a0b206eb-3265-4b08-8bd4-d21b9c52c827`) |
