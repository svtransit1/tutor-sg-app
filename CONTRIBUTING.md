# Contributing to tutor-sg

Welcome to the tutor-sg project — a Singapore primary school AI tutor app, fully on-device LLM, covering P1–P6 across Math, English, Chinese Mother Tongue, and Science. This is an autonomous agent fleet project managed via [Paperclip](https://paperclip.dev); human contributors are welcome too.

## Quick start

1. **Read the spec first.** The [App Design Document](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/docs/ARCHITECTURE.md) (repo copy ←→ [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)) is the authoritative source of truth for product behaviour and technical architecture. Read it before writing any code.
2. **Locked decisions.** [`decisions-locked.md`](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md) (Obsidian wiki) lists every decision Boss has locked. Never override these without a `boss-needed` issue.
3. **Branch hygiene.** Each issue gets a feature branch: `feat/<short-name>` or `fix/<short-name>`. Never commit directly to `main`.
4. **Verification.** Build + smoke test must pass before marking work as `in_review`.

## Development conventions

| Area | Rule |
|---|---|
| **Framework** | React Native + Expo + TypeScript (single codebase, iOS + Android) |
| **Package manager** | pnpm (workspaces monorepo) |
| **Testing** | Jest (unit + component), Detox or Maestro (E2E) |
| **Linting** | ESLint + Prettier (pre-commit via husky) |
| **CI** | GitHub Actions — build both platforms, run tests, lint, format, type-check |
| **Secrets** | Never commit; use `.env.local` + cloud secrets manager |
| **Dependencies** | Prefer well-maintained, well-trusted libraries; document any vendored dep with license + rationale |

## Quality bars (enforced by Tortoise on every PR)

Every PR must pass:

1. **Tests pass** — unit + integration + at least one full-flow scenario
2. **Bilingual completeness** — every new UI string has an EN + zh-Hans counterpart
3. **Accessibility** — kid-friendly font sizes (min 16pt body), high contrast, no-text-only states (icons + labels), VoiceOver/TalkBack labels
4. **Privacy review** — no new code path sends child photos / OCR text / kid free-text off-device
5. **No restricted SDKs** — no behavioural-ad SDKs, no fingerprinting libraries
6. **Performance budget** — LLM-heavy operations don't block UI thread; camera frame stays >30 fps during preview; cold start <3 sec on mid-tier device
7. **Branch hygiene** — feature branch, descriptive commit messages, no direct main commits
8. **Verification** — build succeeded locally, smoke test ran, screenshot or log attached to PR

## Commit conventions

- Agent-tagged commits: `[owl]`, `[bee]`, `[wolf]`, `[tortoise]`, `[parrot]`, `[foxy]`, `[sage]`, `[flutter]`
- Format: `[agent] AAAS-NNN: short description of change`
- Example: `[owl] AAAS-140: scaffold docs/ structure with README, CONTRIBUTING, ARCHITECTURE`

## Branch naming

| Type | Pattern |
|---|---|
| Feature | `feat/aaas-NNN-short-description` |
| Bugfix | `fix/aaas-NNN-short-description` |
| Agent review/merge branch | `tortoise/aaas-NNN-short-description` |

## Review protocol

All reviews follow the [Fleet Review Protocol](docs/reviews/README.md). Every review must start with exactly one of:

```md
Review: APPROVED
Review: CHANGES REQUESTED
Review: BLOCKED
```

## Escalation ladder (stuck issues)

1. First `CHANGES REQUESTED` → route to the original owner with specific fixes
2. Second `CHANGES REQUESTED` → route to the senior owner for that area
3. Third `CHANGES REQUESTED` → route to Foxy (PM) for adjudication
4. Escalate to Boss only for: spending, publishing, secrets, irreversible operations, legal/compliance, final public release, core product identity changes

## Docs/ structure

| Directory | Purpose |
|---|---|
| [`docs/decisions/`](docs/decisions/README.md) | Locked-in decisions, dated |
| [`docs/research/`](docs/research/README.md) | Investigations, comparisons |
| [`docs/lessons/`](docs/lessons/README.md) | Postmortems, gotchas |
| [`docs/reviews/`](docs/reviews/README.md) | Review records that survive past the issue thread |
| [`docs/assets/`](docs/assets/README.md) | Screen-flow specs, UI handoff notes |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full technical architecture |

Issue comments are for task-local status. Use `docs/` for anything that should outlive the issue.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Xcode ≥ 16 (macOS, for iOS builds)
- Android Studio + Android SDK 34+ (for Android builds)
- Expo EAS account (for builds via EAS)

## First-time setup

```bash
git clone https://github.com/aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app
pnpm install
```

## Running locally

```bash
# iOS Simulator
pnpm --filter mobile ios

# Android emulator
pnpm --filter mobile android

# Web (parent dashboard companion)
pnpm --filter web dev
```

## Running tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test -- --watch

# Single package
pnpm --filter packages/shared test
```

## Useful scripts

```bash
# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Compute model integrity hashes
npx tsx scripts/compute-model-hashes.ts /path/to/model-dir
```
