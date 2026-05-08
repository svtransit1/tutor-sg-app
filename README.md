# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Governance:** [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

> **Status:** The monorepo structure (`pnpm-workspace.yaml`, root `package.json`, `mobile/package.json`, all `packages/*/package.json`) is being set up via `feat/aaas-748-mobile-scaffold`. Once merged, all commands below will work from a clean clone. Until then, run `git stash pop` on that branch to restore the local workspace.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22 | Developed on 25.9.0. Match CI: `.github/workflows/ci.yml` uses `20` |
| pnpm | >= 9 | Developed on 10.33.0. Match CI |
| Expo CLI | Latest | `pnpm add -g expo-cli` or use `npx expo` |
| Xcode | >= 16 | iOS development (macOS only) |
| CocoaPods | >= 1.16 | iOS deps: `gem install cocoapods` |
| Android Studio | Hedgehog+ | Android development (API 34+ recommended) |
| JDK | >= 17 | Android builds |
| Ruby | >= 3.2 | For CocoaPods (macOS) |

Verify installed versions:

```bash
node --version    # >= 22
pnpm --version    # >= 9
```

---

## Quick start

### 1. Clone

```bash
git clone https://github.com/aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app
```

### 2. Install dependencies

```bash
pnpm install
```

This installs the root workspace, all `packages/*`, and `mobile/`.

For iOS, also install CocoaPods:

```bash
cd mobile/ios && pod install && cd ../..
```

### 3. Build all packages

```bash
pnpm -r build
```

(or individual: `pnpm --filter @tutor-sg/shared build`)

### 4. Typecheck

```bash
pnpm typecheck
```

Runs `tsc --noEmit` across all workspace packages and the mobile app.

### 5. Lint

```bash
pnpm lint
```

Runs ESLint on all workspace packages.

### 6. Test

```bash
pnpm test
```

Runs Jest across the whole monorepo.

### 7. Run on iOS Simulator

```bash
pnpm --filter tutor-sg-mobile ios
```

Or start the dev server and press `i`:

```bash
pnpm --filter tutor-sg-mobile start
# Press "i" in the Metro bundler terminal
```

**iOS Simulator setup:**
- Requires Xcode installed from the Mac App Store
- Open Xcode → Settings → Platforms → install iOS 18+ simulator
- Launch a simulator: `open -a Simulator` or Xcode → Open Developer Tool → Simulator

### 8. Run on Android emulator

```bash
pnpm --filter tutor-sg-mobile android
```

**Android emulator setup:**
- Install Android Studio, open it → More Actions → Virtual Device Manager
- Create a device (e.g. Pixel 8 API 35)
- Set `ANDROID_HOME` in your shell profile:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  ```
- Start the emulator before running `pnpm android`

---

## Project structure

```
tutor-sg-app/
├── mobile/                    # Expo app (React Native)
│   ├── app/                   # Expo Router screens
│   │   ├── (kid)/             # Child-facing screens
│   │   ├── (onboarding)/      # First-launch flow screens
│   │   └── (parent)/          # Parent dashboard screens
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── i18n/              # Locale strings (en, zh-Hans)
│   │   ├── screens/           # Screen-level logic
│   │   ├── services/          # Service modules (LLM, OCR, etc.)
│   │   └── storage/           # Persistence helpers
│   ├── __mocks__/             # Module mocks for tests
│   └── ios/ android/          # Native projects (Expo managed)
│
├── packages/                  # Workspace packages
│   ├── shared/                # Types, schemas, config, model hashes
│   ├── i18n/                  # i18n provider + utilities
│   ├── device-tier/           # RAM/NPU detection
│   ├── database/              # SQLite schema + client
│   ├── llm/                   # LLM inference abstraction
│   ├── features/              # Feature gating / entitlements
│   └── perf/                  # Performance utilities
│
├── data/                      # Static content
│   ├── taxonomy.json          # Subject/topic taxonomy
│   └── question-bank.json     # Generated question bank
│
├── schema/                    # JSON schemas
├── scripts/                   # Dev tooling (model hashes, etc.)
├── syllabus-pdfs/             # Public MOE syllabus PDFs
├── docs/                      # Design docs, reviews, decisions
│   ├── ARCHITECTURE.md        # System architecture
│   ├── GOVERNANCE.md          # Agent roles, review rules
│   ├── reviews/               # Review records
│   └── decisions/             # Locked decisions
└── .github/workflows/         # CI (typecheck → lint → bundle)
```

---

## Available scripts

| Script | Location | Description |
|--------|----------|-------------|
| `pnpm typecheck` | Root | Typecheck all workspace packages + mobile |
| `pnpm lint` | Root | Lint all packages |
| `pnpm test` | Root | Run all tests |
| `pnpm format:check` | Root | Check Prettier formatting |
| `pnpm format:write` | Root | Auto-fix formatting |
| `pnpm --filter tutor-sg-mobile start` | Root | Start Expo dev server |
| `pnpm --filter tutor-sg-mobile ios` | Root | Start Expo + iOS |
| `pnpm --filter tutor-sg-mobile android` | Root | Start Expo + Android |
| `pnpm --filter tutor-sg-mobile e2e:smoke` | Mobile | Maestro smoke test |
| `pnpm --filter tutor-sg-mobile e2e` | Mobile | Maestro full test suite |
| `pnpm -r build` | Root | Build all packages |

---

## Environment variables

No `.env.example` exists yet. Create `.env.local` at repo root with:

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `EXPO_PUBLIC_CDN_URL` | Dev only | Cloudflare R2 base URL for model files |

**Never commit `.env*` files.** See `.gitignore`.

---

## Branch naming & commit conventions

Per ADD §11 and `docs/GOVERNANCE.md`:

| Branch pattern | Purpose |
|----------------|---------|
| `main` | Shippable (protected, no direct pushes) |
| `feat/<short-name>` | New features |
| `fix/<short-name>` | Bug fixes |

Commit messages use agent tags:

```
[bee] AAAS-690: M0 dev setup README
[wolf] AAAS-127: LiteRT native module integration
```

Accepted tags: `[bee]`, `[wolf]`, `[owl]`, `[foxy]`, `[flutter]`, `[sage]`.

---

## Verification before review

Before marking an issue `in_review`, verify:

1. **Typecheck** — `pnpm typecheck` passes with no errors
2. **Lint** — `pnpm lint` passes
3. **Tests** — `pnpm test` passes (new tests for new code)
4. **Build** — `pnpm -r build` succeeds
5. **Bilingual** — Every new UI string has both `en` and `zh-Hans` entries
6. **Feature branch** — Working on a branch off `main`, not directly on `main`

---

## CI/CD

GitHub Actions runs on push/PR to `main` (see `.github/workflows/ci.yml`):

1. **typecheck** — `tsc --noEmit` on all packages
2. **lint** — ESLint
3. **bundle** — Expo export for iOS + Android (after typecheck + lint pass)

PRs must pass CI before merging. Branch protection requires 1 approval + CI green.

---

## First-launch model download

Models are **not bundled** in the app package (app stays < 50 MB). On first launch:

1. Detect device tier (RAM + NPU)
2. Download required model from Cloudflare R2 CDN
3. Verify SHA-256 integrity hash
4. Load into inference engine

Model integrity manifests live in `packages/shared/src/models/integrity.json`.

### Refresh model hashes

```bash
mkdir -p /tmp/model-staging
cp path/to/new-model.gguf /tmp/model-staging/
npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json
```

### Placeholder hashes

Until real model files exist, `integrity.json` ships with all-zero `sha256` placeholders. The download verifier treats these as "unverified" and skips hash checks in dev/staging builds.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pnpm install` fails on native deps | Ensure Xcode (macOS) or Android Studio is installed |
| `pod install` fails | `cd mobile/ios && bundle exec pod install --repo-update` |
| Metro can't resolve workspace packages | `pnpm install` (re-symlink workspace packages) |
| Type errors in workspace packages | Run `pnpm typecheck` from root to see full error list |
| Missing `react` type declarations | Add `"types": ["node", "jest", "react"]` to the package's `tsconfig.json` |
| EAS build fails | Check `mobile/eas.json` — first-time Expo devs may need `eas init` |
| "No ESLint config" | Each package needs its own `eslint.config.*` or inherit from root |
| pnpm resolution errors | `pnpm install --frozen-lockfile` in CI; locally try `pnpm install --no-frozen-lockfile` then commit updated lockfile |
