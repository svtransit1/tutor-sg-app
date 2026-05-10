# Contributing to tutor-sg

> **Purpose:** Onboarding guide for new developers joining the AaaS fleet.
> **Authoritative spec:** [App Design Document](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/README.md) (ADD)
> **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
> **Governance:** [docs/GOVERNANCE.md](docs/GOVERNANCE.md)
> **Review protocol:** [docs/FLEET_REVIEW_PROTOCOL.md](docs/FLEET_REVIEW_PROTOCOL.md)

---

## Table of Contents

- [1. What is tutor-sg?](#1-what-is-tutor-sg)
- [2. Quick start](#2-quick-start)
- [3. Prerequisites](#3-prerequisites)
- [4. Full setup](#4-full-setup)
- [5. Monorepo map](#5-monorepo-map)
- [6. Development workflow](#6-development-workflow)
- [7. Code conventions](#7-code-conventions)
- [8. Quality gates](#8-quality-gates)
- [9. Pull request lifecycle](#9-pull-request-lifecycle)
- [10. Paperclip workflow](#10-paperclip-workflow)
- [11. Architecture in brief](#11-architecture-in-brief)
- [12. Troubleshooting](#12-troubleshooting)
- [13. Where to go for help](#13-where-to-go-for-help)

---

## 1. What is tutor-sg?

tutor-sg is a **free-to-download AI tutor mobile app** for Singapore primary school students (P1–P6), covering all 4 core subjects (Math, English, Chinese MT, Science). It runs an on-device LLM for full privacy and offline use.

Key facts:

- **Buyer:** parent. **Direct user:** kid. Both have separate UI flows in a single account.
- **Bilingual:** English + Simplified Chinese.
- **Freemium:** free to use up to a daily cap, then IAP unlocks more.
- **Hero feature:** "snap your homework, get help" — kid takes a photo, on-device LLM gives feedback, session is logged for parent review.
- **Premium:** P5/P6 PSLE study programme as a subscription IAP.
- **Framework:** React Native + Expo + TypeScript.
- **Package manager:** pnpm 10 — single monorepo with shared packages.
- **Issue tracker:** Paperclip (source of truth), mirrored to GitHub Issues for external deps.

There is no cloud LLM, no server-side OCR, and no child data ever leaves the device.

---

## 2. Quick start

```bash
# 1. Clone
git clone git@github.com:aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app

# 2. Enable pnpm
corepack enable
corepack prepare pnpm@10.33.0 --activate

# 3. Install deps
pnpm install

# 4. Environment
cp .env.example .env.local
# Edit .env.local with real values

# 5. Start
pnpm mobile:start
```

This launches the Expo dev server. Press `i` for iOS Simulator or `a` for Android emulator.

---

## 3. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x | Runtime |
| pnpm | 10.33.0 | Package manager (`corepack enable`) |
| Xcode | 16.x | iOS development (macOS only) |
| Xcode CLI tools | — | `xcode-select --install` |
| Android Studio | Latest | Android emulator + SDK |
| Expo CLI (`eas-cli`) | Latest | EAS builds & submissions |
| CocoaPods | Latest | `sudo gem install cocoapods` |
| Ruby | 3.x | Bundled with macOS |

### Verify your setup

```bash
node --version    # >= 20
pnpm --version    # 10.33.0
xcodebuild -version  # if on macOS
```

---

## 4. Full setup

### 4.1 Git hooks

```bash
pnpm prepare
```

This runs `husky`, which installs a pre-commit hook that lints and type-checks staged files.

### 4.2 Environment variables

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Source |
|----------|-------------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase dashboard |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID | expo.dev project |

Never prefix real secrets (service keys, API secrets) with `EXPO_PUBLIC_` — doing so embeds them in the client binary.

### 4.3 Running on iOS

```bash
pnpm mobile:ios
```

First-time iOS setup:

1. Ensure Xcode 16+ is installed
2. Open `mobile/ios/` at least once so CocoaPods installs
3. Or run: `cd mobile/ios && pod install`

### 4.4 Running on Android

```bash
pnpm mobile:android
```

First-time Android setup:

1. Install Android Studio
2. Create an AVD (API 34+ recommended)
3. Ensure `ANDROID_HOME` is set in your shell profile
4. Start the emulator before running the command

### 4.5 EAS builds

One-time EAS setup (see [docs/EAS.md](docs/EAS.md)):

```bash
npm install -g eas-cli
eas login
cd mobile
eas init
eas project:init
```

Then use:

```bash
pnpm eas:build:dev              # iOS simulator + Android debug
pnpm eas:build:preview          # TestFlight + signed APK
pnpm eas:build:production       # App Store + Play Store
```

---

## 5. Monorepo map

```
tutor-sg-app/
├── mobile/                         # React Native / Expo app
│   ├── app/                        # Expo Router pages (file-based routing)
│   │   ├── (kid)/                  # Kid-facing screens (home, camera, history)
│   │   ├── (onboarding)/           # First-launch flow (welcome, sign-in, consent, PIN)
│   │   ├── (parent)/               # Parent dashboard (PIN-gated)
│   │   └── auth/                   # Auth callback
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── i18n/                   # i18n setup + locale JSON (EN + zh-Hans)
│   │   ├── models/                 # Domain types
│   │   ├── screens/                # Screen-level components (non-route)
│   │   ├── services/               # Auth, Supabase, model download, telemetry
│   │   ├── storage/                # SQLite, secure store wrappers
│   │   └── types/                  # TypeScript type declarations
│   ├── modules/                    # Expo native modules
│   │   └── tutor-sg-device-info/   # Device RAM/NPU detection for tiering
│   ├── e2e/                        # Maestro E2E test flows
│   └── eas.json                    # EAS build profiles
├── packages/
│   ├── device-tier/                # @tutor-sg/device-tier — RAM + NPU detection
│   ├── features/                   # @tutor-sg/features — free/trial/paid gates
│   ├── llm/                        # @tutor-sg/llm — subject classifier, model routing, prompts
│   └── shared/                     # @tutor-sg/shared — env config, model registry, i18n keys, schemas
├── scripts/
│   ├── compute-model-hashes.ts     # SHA-256 for model artifact verification
│   └── generate_content_pack.py    # Question bank generator
├── data/
│   ├── question-bank.json          # AI-generated practice questions
│   └── taxonomy.json               # Subject/topic taxonomy tree
├── schema/
│   └── question-bank-schema.json   # JSON Schema for question bank
├── syllabus-pdfs/extracted/        # MOE syllabus topic trees (P1–P6, all 4 subjects)
├── docs/
│   ├── ARCHITECTURE.md             # System topology, stack, data flow
│   ├── EAS.md                      # EAS build & submit guide
│   ├── FLEET_REVIEW_PROTOCOL.md    # Review lifecycle, quality gates, escalation
│   ├── GOVERNANCE.md               # Agent fleet, review rules, branch protection
│   ├── decisions/                  # Locked technical decisions
│   └── reviews/                    # Review records (permanent)
├── .github/workflows/ci.yml        # CI pipeline
├── tsconfig.base.json              # Shared TypeScript configuration
└── pnpm-workspace.yaml             # Workspace definition
```

### Package dependency graph

```
mobile/
  └─ @tutor-sg/shared
       ├─ @tutor-sg/device-tier
       ├─ @tutor-sg/features
       └─ @tutor-sg/llm
```

### Package scripts reference

| Command | What it does |
|---------|-------------|
| `pnpm typecheck` | TypeScript check across all packages + mobile |
| `pnpm lint` | ESLint across the root (mobile linting is per-package) |
| `pnpm test` | Run all tests (packages + mobile) |
| `pnpm mobile:start` | Start Expo dev server |
| `pnpm mobile:ios` | Start + open iOS simulator |
| `pnpm mobile:android` | Start + open Android emulator |

---

## 6. Development workflow

### 6.1 Branch naming

| Pattern | Example | Purpose |
|---------|---------|---------|
| `main` | `main` | Shippable, protected |
| `feat/<short-name>` | `feat/aaas-1148-camera-flow` | Features |
| `fix/<short-name>` | `fix/aaas-1047-missing-locale-keys` | Bugfixes |

Never push directly to `main`. Always use a feature branch and submit a PR.

### 6.2 Commit tagging

Agent-tagged commits: `[bee]`, `[wolf]`, `[owl]`, `[foxy]`, `[flutter]`, `[sage]`

```bash
git commit -m "[bee] AAAS-1234: add camera fallback UI for OCR failures"
```

Keep commits descriptive. Reference the Paperclip issue ID when applicable.

### 6.3 Local development loop

```bash
# 1. Create branch
git checkout -b feat/aaas-<id>-<short-name>

# 2. Make changes
# 3. Run quality gates frequently
pnpm typecheck && pnpm lint && pnpm test

# 4. Commit (Husky runs lint-staged automatically)
git add .
git commit -m "[bee] AAAS-<id>: description"

# 5. Push
git push -u origin feat/aaas-<id>-<short-name>

# 6. Create PR on GitHub
# 7. Wait for review
```

### 6.4 Pre-commit hooks

Husky runs `lint-staged` which enforces:
- ESLint on staged `*.{ts,tsx}` files
- TypeScript type-checking on staged files

These hooks are mandatory. If your commit is rejected, fix the lint/type issues, not the hooks.

---

## 7. Code conventions

### 7.1 TypeScript

- **Strict mode** enabled across all packages (`strict: true` in tsconfig)
- Target ES2022, module ES2022
- `noEmit: true` — TypeScript is for type-checking only (Babel/Metro compile)
- Prefer `interface` over `type` for object shapes
- Prefer `const` over `let`; avoid `var`
- No `any` (enforced by ESLint — warning, not error)
- Destructure props in component parameters, not in the function body

### 7.2 Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Files/dirs | `kebab-case` | `photo-review-screen.tsx` |
| React components | PascalCase | `PhotoReviewScreen` |
| Functions | camelCase | `useCameraPermission()` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_COUNT` |
| Types/interfaces | PascalCase | `OcrResult`, `SessionLog` |
| Props interface | `{ComponentName}Props` | `PhotoReviewScreenProps` |
| Environment vars | `EXPO_PUBLIC_*` | `EXPO_PUBLIC_SUPABASE_URL` |

### 7.3 React / RN conventions

- Use **functional components** with hooks (no class components)
- Custom hooks prefixed with `use` in `src/hooks/`
- Expo Router for navigation (file-based routing in `mobile/app/`)
- Styling via `StyleSheet.create()` — no inline styles for reusable components
- Import alias `@/` maps to `mobile/src/` (configured in tsconfig + babel)
- Place reusable components in `src/components/`, screen-specific in `src/screens/`

### 7.4 i18n (bilingual requirement)

Every user-facing string must have both `en` and `zh-Hans` translations.

- Locale files live in `mobile/src/i18n/locales/`
- Use flat phrase-keyed JSON with `keySeparator: false` in i18next config
- Example: `mobile/src/i18n/locales/en.json` and `zh-Hans-SG.json`
- Use `t('key')` from `react-i18next` — never hardcode display strings
- Chinese MT subject uses Simplified Chinese only (per Singapore MOE curriculum)

### 7.5 Testing

- **Unit tests:** Jest for packages, Jest + React Native Testing Library for mobile
- **E2E tests:** Maestro (`mobile/e2e/`)
- Coverage threshold: 50–60% lines per package
- Place tests alongside the module they test: `src/components/Foo.test.tsx`
- At minimum: one happy-path unit test + one edge case per new component/function

### 7.6 Content rules

- **MOE syllabus PDFs** — public, cite source
- **Past papers (TYS)** — licensed only; never republish verbatim
- **Textbooks** (Marshall Cavendish, 欢乐伙伴) — **forbidden**, no close paraphrasing
- **AI-generated** — preferred; generate fresh questions aligned to the syllabus tree
- See `data/taxonomy.json` for the subject/topic tree reference

---

## 8. Quality gates

Every PR must pass these gates before merge:

| # | Gate | Command / check | Enforced by |
|---|------|----------------|-------------|
| 1 | **TypeScript** | `pnpm typecheck` — zero errors | CI + pre-commit |
| 2 | **Lint** | `pnpm lint` — zero errors | CI + pre-commit |
| 3 | **Tests** | `pnpm test` — all pass | CI |
| 4 | **Bilingual** | Every new UI string has EN + zh-Hans | Review (Tortoise) |
| 5 | **Accessibility** | Min 16pt body, high contrast, icons+labels, VoiceOver/TalkBack labels | Review |
| 6 | **Privacy** | No child photos/OCR/kid text leaves device. No analytics SDKs in kid screens. | Review (Owl) |
| 7 | **No restricted SDKs** | No behavioral-ad or fingerprinting SDKs | Review (Tortoise) |
| 8 | **Performance** | LLM ops off main thread, camera >30 fps, cold start <3s | Review (Wolf/Owl) |
| 9 | **Branch hygiene** | Feature branch from main, descriptive commits, agent-tagged | Review (Tortoise) |
| 10 | **Verification** | Build succeeded locally, smoke test ran, evidence attached | Review (Tortoise) |

### CI pipeline

Defined in `.github/workflows/ci.yml`:

```
Push/PR to main
  ├── Typecheck (pnpm typecheck)
  ├── Lint (pnpm lint)
  └── (both pass) → Bundle (npx expo export ios + android)
```

CI runs on push/PR to `main`. In-progress runs for the same branch are auto-cancelled (except `main`).

---

## 9. Pull request lifecycle

### 9.1 State machine

```
in_progress -> in_review -> { APPROVED | CHANGES_REQUESTED | BLOCKED }
                 ^              |                |              |
                 +--------------+                |              |
                    (rework + resubmit)           |              |
                                                  v              v
                                             done (merge)   blocked
```

### 9.2 Roles

| Agent | Review scope | Power |
|-------|-------------|-------|
| Tortoise | All PRs — quality gates (S8) | Blocks on any gate failure |
| Wolf | Feature code, mobile implementation | Approves code PRs |
| Bee | Camera/OCR, parent log, IAP, shared packages | Approves code PRs |
| Owl | Architecture, model routing, inference, framework | Gates architecture PRs |
| Flutter | UI/UX, accessibility, style guide | Approves visual PRs |
| Sage | Syllabus content, bilingual, Chinese MT | Approves content PRs |
| Foxy | Product scope, merge approval, escalation | Final gate to main |

### 9.3 How to submit a PR

1. Push your feature branch
2. Open a PR against `main` on GitHub
3. In the PR description, include:
   - Paperclip issue ID(s)
   - Summary of changes
   - Verification evidence (build output, test results, screenshots)
   - Any notable design decisions
4. The reviewer listed in CODEOWNERS picks it up

### 9.4 Architecture-touching PRs

Any PR touching model routing, inference pipeline, framework config, architecture docs, or data privacy requires Owl approval in addition to the standard review. Mark with `ARCHITECTURE: YES` in the PR description.

---

## 10. Paperclip workflow

The fleet uses Paperclip as the source-of-truth issue tracker.

### 10.1 Heartbeats

When woken, scan assigned issues and act:
1. `in_progress` -> continue working
2. `in_review` -> review if you're the reviewer
3. `blocked` -> check if the blocker is cleared
4. `pending` -> claim and start

### 10.2 Issue lifecycle

```
pending -> in_progress -> in_review -> done
                   \-> blocked
```

### 10.3 Comment conventions

- Leave task-local status in issue comments
- Put reusable decisions/research/lessons in `docs/` subdirectories
- Handoffs use the template from FLEET_REVIEW_PROTOCOL S8.1

### 10.4 Escalation ladder

| Level | Route to | When |
|-------|----------|------|
| 1st | Original owner | First CHANGES_REQUESTED on review |
| 2nd | Senior owner (Owl/Wolf/Foxy) | Second CHANGES_REQUESTED |
| 3rd | Foxy (PM) | Third CHANGES_REQUESTED |
| 4th | Boss (via `boss-needed` issue) | Spending, publishing, secrets, legal, irreversible ops |

---

## 11. Architecture in brief

### 11.1 Data never leaves

**Hard rule:** child photos, OCR text, kid free-text, and session data never leave the device. Only opt-in anonymized usage telemetry leaves (default: OFF).

### 11.2 On-device LLM

| Subject | High-tier model | Mid-tier model | Engine |
|---------|----------------|----------------|--------|
| Math, English, Science | Gemma 4 E4B | Gemma 4 E2B | ExecuTorch (iOS) / LiteRT-LM (Android) |
| Chinese MT | Qwen 3.5 4B | Qwen 3.5 2B | ExecuTorch (iOS) / LiteRT-LM (Android) |

Models are downloaded on first launch (not bundled). App stays under 50 MB.

### 11.3 Device tier detection

| Tier | RAM | NPU | Models |
|------|-----|-----|--------|
| `high` | >=6 GB | Modern (A14+ / SD8Gen1+ / Dimensity 9000+) | E4B / Qwen 4B |
| `mid` | 3-5 GB | Any | E2B / Qwen 2B |
| `unsupported` | <3 GB | -- | Blocked |

### 11.4 Parent dashboard

Separate PIN-gated UI inside the same app. Parents view session logs, progress summaries, and can flag sessions. PIN is stored locally only (hashed).

### 11.5 Feature gates

Features are gated by entitlement tier (free / trial / paid):

```ts
const FEATURE_GATES = [
  { feature: "photo_solve",              minimumTier: "free" },
  { feature: "photo_solve_unlimited",    minimumTier: "trial" },
  { feature: "parent_report",            minimumTier: "trial" },
  { feature: "chinese_stroke_check",     minimumTier: "trial" },
  { feature: "study_programme",          minimumTier: "paid" },
];
```

---

## 12. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `pnpm install` fails | pnpm version mismatch | Check `packageManager` field, run `corepack enable && corepack prepare` |
| Metro can't resolve modules | Missing deps or hoisting issue | Run `pnpm install` from root; verify `pnpm-workspace.yaml` |
| iOS build fails at CocoaPods | Outdated Podfile.lock | `cd mobile/ios && pod install` |
| `EAS project not found` | `eas init` not run | Run `eas init` in `mobile/` |
| `EXPO_PUBLIC_*` values missing | No `.env.local` | `cp .env.example .env.local` and fill in values |
| Type errors across packages | Stale tsc cache | Delete `node_modules/.cache/ts*.tsbuildinfo` and retry |
| Model integrity check fails | Stale `integrity.json` | Re-run `scripts/compute-model-hashes.ts` |
| Git hooks not running | Husky not installed | `pnpm prepare` (runs `husky`) |
| Pre-commit hook fails | lint-staged / eslint | Fix lint + typecheck issues in staged files |
| Metro bundler slow / hangs | Cache issues | `npx expo start --clear` |
| Android build fails on native module | Module not linked | `cd mobile && expo prebuild --clean` |

---

## 13. Where to go for help

| Who | Role | Best for |
|-----|------|----------|
| Wolf | Mobile Coder | Feature implementation, code review |
| Bee | Mobile Coder | Camera/OCR, parent log, IAP |
| Owl | CTO | Architecture, model routing, inference |
| Foxy | PM | Product scope, merge approval, escalation |
| Flutter | UX | UI/design, accessibility |
| Sage | Content | Syllabus, bilingual, Chinese MT |

For irreversible decisions (spending, publishing, secrets, legal) or strategic pivots, file a `boss-needed` issue tagged with the relevant topic.

---

_This document is maintained by the AaaS fleet. Update when the monorepo structure, conventions, or workflows change._
