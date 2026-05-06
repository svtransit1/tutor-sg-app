---
adr: 001
title: E2E Test Framework Selection
status: accepted
date: 2026-05-06
deciders: Parrot
---

# ADR 001: E2E Test Framework Selection

## Context

The tutor-sg app is built with React Native + Expo (TypeScript). We need an end-to-end test framework to verify critical user paths on both iOS and Android. E2E tests run against a real app on device/simulator, testing the integrated system including native modules.

## Options Considered

### 1. Detox (Wix)

**Description:** Gray-box E2E testing framework purpose-built for React Native. Synchronizes automatically with the RN bridge to know when the app is idle.

**Pros:**

- Deep RN integration — auto-syncs with JS thread, native timers, network
- Battle-tested at scale in RN apps
- Programmatic JS/TS test API (familiar to the team)
- Mature ecosystem, extensive docs
- Built-in device artifacts (screenshots, logs)

**Cons:**

- **Tricky Expo setup** — requires `expo run:ios/android` dev builds, config per platform
- **Flaky on CI** — auto-sync breaks with certain animations/navigation libraries; requires ongoing maintenance per RN version bump
- **Slow test authoring** — each test is code, harder to debug on failure
- **Platform-specific config** — separate EarlGrey (iOS) and Espresso (Android) setup
- **No built-in video recording** of test runs

### 2. Maestro (Mobile.dev)

**Description:** Declarative YAML-based mobile E2E testing framework. Works with any tech stack (React Native, Flutter, native). Operates at the accessibility layer.

**Pros:**

- **Expo-friendly** — works with `expo run:ios/android` and even Expo Go for basic testing
- **Declarative YAML** — concise, readable by non-specialists; easy to code-review
- **No sync headaches** — built-in smart waits; no flaky auto-sync to tune
- **Single flow works cross-platform** — same `.yaml` runs on iOS and Android
- **Excellent CI support** — official Docker image, no Android/iOS SDK management
- **Built-in artifacts** — video recording, screenshots, hierarchy on failure
- **Hot reload** — edit flow, re-run immediately without rebuild

**Cons:**

- Newer ecosystem (2022+) vs Detox (2017+)
- Less programmatic control — assertions limited to YAML primitives (can extend via custom JS snippets)
- Maestro Cloud is paid (local CLI + Docker runner are free)
- Smaller community and fewer resources
- Cannot directly access app-internal state (purely black-box)

### 3. Patrol (leancode.co)

**Description:** E2E framework from the Flutter ecosystem, built on top of integration testing APIs.

**Pros:**

- Great Flutter experience
- Strong integration testing API

**Cons:**

- **Flutter-only** — cannot test React Native apps
- Not applicable to this project

## Decision: Maestro

We choose **Maestro** for the following reasons:

1. **Expo compatibility** — Maestro works seamlessly with Expo dev builds (`expo run:ios/android`). Detox requires platform-specific native test runners and complex Expo integration.

2. **CI simplicity** — Maestro's Docker image (`maestro Docker image`) eliminates Android/iOS SDK maintenance in CI. Detox requires full platform toolchains per runner.

3. **Flake resistance** — Maestro's smart-wait mechanism (waits up to a timeout for elements to appear) avoids Detox's most common failure mode: auto-sync breaking due to timers, animations, or third-party native modules.

4. **Multi-platform from one file** — A single YAML flow runs on both iOS and Android. Detox requires separate EarlGrey (iOS) and Espresso (Android) test infrastructure.

5. **Artifacts by default** — Maestro captures video, screenshots, and view hierarchy on every run at no extra cost. This speeds up CI debugging significantly.

6. **Team accessibility** — YAML flows are understandable by QA and PM. Detox tests are code and require TypeScript/JS expertise to review.

7. **Expo Router / navigation compat** — Maestro works at the accessibility layer and is not coupled to RN internals, so it won't break when we upgrade React Native or Expo versions.

## Consequences

### Positive

- Faster test authoring and iteration
- Reliable CI runs without auto-sync tuning
- Cross-platform coverage from a single flow
- Rich failure artifacts for debugging

### Negative

- Cannot assert on internal app state directly (pure black-box)
- Must keep YAML flows clean and avoid duplication (use Maestro `include` for shared steps)
- Contract: every interactable element needs an `accessibilityLabel` for Maestro to target reliably

## How to Install

```bash
# Install Maestro CLI (macOS)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Or via Homebrew
brew tap mobile-dev-inc/tap
brew install maestro
```

## CI Integration

We use the official Maestro Docker image:

```yaml
- name: Maestro E2E
  uses: mobile-dev/maestro-action@v2
```

See CI workflow for current configuration.
