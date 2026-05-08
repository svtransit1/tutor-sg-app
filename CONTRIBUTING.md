# Contributing to tutor-sg

**tutor-sg** is an on-device LLM AI tutor app for Singapore primary school students (P1–P6), all 4 core subjects (Math, English, Chinese MT, Science), built with React Native + Expo + TypeScript.

**Owner:** Agent as a Service Pte. Ltd.
**Issue tracker:** Paperclip company `AaaS`
**Authoritative spec:** `docs/arch/wiki` (see README)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.x | `fnm` or `nvm` recommended |
| pnpm | 9.x | Corepack: `corepack enable && corepack prepare pnpm@9 --activate` |
| Xcode | 16+ | iOS Simulator, from Mac App Store |
| Android Studio | Hedgehog+ | Android emulator, API 34 |
| Expo CLI | latest | `npx expo` or global install |
| EAS CLI | latest | `npm install -g eas-cli` |

**Platform support:** iOS 16+ (iPhone 12+), Android 11+ (≥4 GB RAM).

## Quick start

```bash
# 1. Install root tooling
pnpm install

# 2. Install mobile app dependencies
cd mobile && pnpm install && cd ..

# 3. Start the dev client
cd mobile && npx expo start
```

This starts the Expo dev server. Press `i` for iOS Simulator or `a` for Android emulator.

### Environment variables

Copy any `.env.example` to `.env.local` in the relevant package. Never commit `.env` or `.env.local`.

```bash
# If .env.example exists in a package
cp packages/<name>/.env.example packages/<name>/.env.local
```

The mobile app uses `expo-secure-store` for auth tokens and `process.env.EXPO_PUBLIC_*` for build-time vars.

## Repository structure

```
tutor-sg-app/
├── .github/workflows/   # CI + EAS Build pipelines
├── .husky/              # Git hooks (lint-staged on pre-commit)
├── mobile/              # Expo / React Native app (entry point)
│   ├── app/             # Expo Router file-based routes
│   │   ├── (kid)/       #   Child-facing screens
│   │   ├── (parent)/    #   Parent dashboard screens
│   │   └── (onboarding)/#   First-launch flow screens
│   └── src/             # App source code
│       ├── components/  #   Shared UI components
│       ├── hooks/       #   Custom React hooks
│       ├── i18n/        #   Localisation (EN + zh-Hans)
│       ├── models/      #   TypeScript types/interfaces
│       ├── screens/     #   Screen-level components
│       ├── services/    #   API / business logic
│       └── storage/     #   SQLite / local persistence
├── packages/            # Internal shared packages (8)
│   ├── database/        #   SQLite schema + migrations
│   ├── device-tier/     #   RAM/NPU detection logic
│   ├── features/        #   Feature gate definitions
│   ├── i18n/            #   Shared translation keys
│   ├── llm/             #   LLM inference + model routing
│   ├── perf/            #   Performance monitoring
│   ├── shared/          #   Common types, schemas, integrity hashes
│   └── theme/           #   Design tokens, colours, typography
├── data/                # Static data (taxonomy, question bank)
├── docs/                # Architecture, governance, reviews, decisions
│   ├── ARCHITECTURE.md  #   System architecture (single source of truth)
│   ├── GOVERNANCE.md    #   Agent roles, review rules, branch protection
│   ├── reviews/         #   Persistent review records
│   ├── decisions/       #   Locked decisions (dated)
│   ├── research/        #   Investigations & comparisons
│   └── lessons/         #   Postmortems & gotchas
├── schema/              # JSON schemas (question bank, etc.)
├── scripts/             # Standalone automation scripts
├── syllabus-pdfs/       # MOE syllabus PDF extracts (never verbatim)
├── eslint.config.mjs    # ESLint flat config root
└── .prettierrc          # Prettier config
```

## Development workflow

### Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-name>` | `feat/aaas-791-contributing-md` |
| Bugfix | `fix/<short-name>` | `fix/pin-gate-timeout` |
| Spike | `spike/<short-name>` | `spike/llm-downloader` |

Always branch from `main`. Never push to `main` directly.

### Commits

Use descriptive commit messages. Prefix with agent tags when applicable:

```
[sage] CONTRIBUTING.md: developer onboarding guide

Covers prerequisites, repo structure, setup steps, development
workflow, review process, quality bars, and escalation paths.
```

### Agent tags

| Tag | Agent |
|-----|-------|
| `[wolf]` | Wolf (mobile coder) |
| `[bee]` | Bee (cross-platform coder) |
| `[owl]` | Owl (CTO) |
| `[foxy]` | Foxy (PM) |
| `[flutter]` | Flutter (UX) |
| `[sage]` | Sage (content) |

### Pre-commit hooks

Husky runs `lint-staged` on every commit, which checks all staged `.ts`/`.tsx` files with ESLint (`--fix` + `--max-warnings=0`) and Prettier (`--write`). Fix all warnings before committing.

## Code quality

Run these before pushing or creating a PR:

```bash
# TypeScript type-check
cd mobile && pnpm typecheck && cd ..

# Lint (ESLint flat config)
# From repo root:
npx eslint mobile/src/ --max-warnings=0

# Format
npx prettier --check "mobile/src/**/*.{ts,tsx}"
npx prettier --write "mobile/src/**/*.{ts,tsx}"  # auto-fix

# Tests
cd mobile && pnpm test && cd ..
```

### CI pipeline

Defined in `.github/workflows/ci.yml`:

1. **Typecheck** — `tsc --noEmit`
2. **Lint** — ESLint with `--max-warnings=0`
3. **Bundle** — Expo export for iOS + Android (runs after typecheck + lint pass)

All three must pass before merge. Branch protection enforces this.

## Quality bars

Every PR must satisfy these 8 quality bars (from the App Design Document §9):

1. **Tests pass** — unit + integration + at least one full-flow scenario
2. **Bilingual completeness** — every new UI string has EN + zh-Hans counterpart
3. **Accessibility** — kid-friendly font sizes (min 16pt body), high contrast, no-text-only states (icons + labels), VoiceOver/TalkBack labels
4. **Privacy review** — no new code path sends child photos, OCR text, or kid free-text off-device
5. **No restricted SDKs** — no behavioral-ad SDKs, no fingerprinting libraries
6. **Performance budget** — LLM-heavy ops don't block UI thread; camera frame stays >30 fps during preview; cold start <3 sec on mid-tier device
7. **Branch hygiene** — feature branch, descriptive commit messages, no direct main commits
8. **Verification** — build succeeded locally, smoke test ran, screenshot or log attached to PR

## Review process

Per `docs/GOVERNANCE.md` and ADD §11:

| Gate | Who | When |
|------|-----|------|
| Code review | Tortoise (review bot) | Every PR |
| Architecture review | Owl (CTO) | Changes to model routing, inference pipeline, framework config, `docs/ARCHITECTURE.md` |
| Merge approval | Foxy (PM) | Final gate before merge to `main` |

Reviews follow the Fleet Review Protocol — each review starts with exactly one of:
- `Review: APPROVED`
- `Review: CHANGES REQUESTED`
- `Review: BLOCKED`

**Escalation ladder for failed reviews:**
1. First `CHANGES REQUESTED` → route to original owner with specific fixes
2. Second `CHANGES REQUESTED` → route to senior owner (Owl, Flutter, or Foxy)
3. Third `CHANGES REQUESTED` → route to Foxy for adjudication
4. Beyond → `boss-needed` issue

## Privacy & security rules

These are **hard rules** — violations are blockers:

- **Child data never leaves the device.** Photos, OCR text, kid free-text chat, and kid profiles stay in-memory or in local SQLite. No exfiltration to any cloud endpoint.
- **No third-party analytics SDKs in child-facing code paths.** Parent dashboard analytics are isolated to the web companion (not built yet).
- **No server-side LLM, OCR, or child content processing.** The cloud layer handles only auth (Supabase), IAP billing (HitPay/Apple/Google), and model CDN (Cloudflare R2). Opt-in anonymised telemetry is the only outbound data — and it's off by default.
- **Model integrity verification.** Every downloaded model file is SHA-256 verified before loading into the inference engine. Failed verification → delete, retry once, then error.
- **Parent PIN gate.** The parent dashboard is protected by a 4-digit PIN (set during onboarding). PIN hash stored in local SQLite only — never transmitted. 5 failed attempts → 60-second cooldown.
- **Purchase security.** All IAPs require parent gate (birth-year challenge, age ≥ 18). Entitlements are cross-checked with Supabase on every foreground.
- **No secrets in code.** Use `.env.local` + EAS secrets. Never commit API keys, tokens, or certificates.

## Bilingual requirements

Every user-facing string must ship with both English and Simplified Chinese (zh-Hans-SG):

- String files live in `mobile/src/i18n/locales/` (flat phrase-keyed JSON, `keySeparator: false`)
- Use `i18next` / `react-i18next` for runtime resolution
- Chinese Mother Tongue subject UI is Simplified-Chinese-only (Singapore MOE mandate)
- Kid can switch language per session (EN homework → EN UI; Chinese MT homework → zh-Hans UI)
- TTS / voice input supports both languages

**Always verify bilingual completeness on any PR that touches UI strings.** Missing translations are a blocker.

## Content guidelines

From ADD §10 and `articles/03-content-sourcing-strategy`:

| Source | Status |
|--------|--------|
| MOE syllabus PDFs | Use freely, cite source |
| Past papers (TYS) | Licensed — use structure/topics only, never verbatim |
| Textbooks (Marshall Cavendish, 欢乐伙伴) | **Forbidden** — do not paste, paraphrase, or reference |
| Test paper sites (sgtestpaper.com) | Grey area — do not republish |
| AI-generated content | Preferred. Generate fresh questions aligned to syllabus topic tree |

Content data lives in `data/` (question bank, syllabus taxonomy) and `schema/` (JSON schemas). Scripts in `scripts/` help with generation.

## EAS Build

Production builds use Expo EAS:

```bash
# Internal distribution (TestFlight / Play Console internal)
cd mobile && npx eas build --platform ios --profile internal
cd mobile && npx eas build --platform android --profile internal

# Preview (for review)
cd mobile && npx eas build --platform ios --profile preview

# Production (App Store + Play Store submission)
cd mobile && npx eas build --platform ios --profile production
cd mobile && npx eas build --platform android --profile production
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `tsc --noEmit` fails with path errors | Metro cache stale | `npx expo start --clear` |
| iOS build fails | Pods out of sync | `cd mobile/ios && pod install && cd ..` |
| ESLint errors on commit | lint-staged running against staged files | Fix errors, `git add` again |
| Android emulator not detected | `ANDROID_HOME` not set | Add `export ANDROID_HOME=$HOME/Library/Android/sdk` to shell rc |
| `pnpm install` fails at root | No pnpm-workspace.yaml (by design) | Root install is for tooling only; ignore package resolution warnings |

## Escalation path

| Issue | Escalate to |
|-------|-------------|
| Code review, CI, build | Tortoise / Wolf |
| Architecture, model routing, framework | Owl |
| Product scope, unresolved reviews, merge to main | Foxy |
| Spending, secrets, legal, publishing, brand identity | Boss (via `boss-needed` Paperclip issue) |

## Reference documents

| Document | Location |
|----------|----------|
| App Design Document | `docs/arch/wiki` (see README) |
| Architecture | `docs/ARCHITECTURE.md` |
| Governance | `docs/GOVERNANCE.md` |
| Locked decisions | `docs/decisions/` |
| Review records | `docs/reviews/` |
| CI workflow | `.github/workflows/ci.yml` |
| Build workflow | `.github/workflows/build.yml` |
| Code style (ESLint) | `eslint.config.mjs` |
| Code style (Prettier) | `.prettierrc` |
| Pre-commit hooks | `.husky/_/pre-commit` + `lint-staged.config.mjs` |
