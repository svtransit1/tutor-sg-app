# Review: AAAS-161 — First EAS development build

**Branch:** feat/aaas-161-eas-dev-build
**Owner:** Bee
**Reviewer:** Tortoise / Wolf

## Deliverables

### 1. Workspace config (root)
- `package.json` — workspace root with pnpm@10.33.0
- `pnpm-workspace.yaml` — includes mobile/, packages/*
- `.npmrc` — pnpm strict mode, auto-install peers
- `pnpm-lock.yaml` — fresh lockfile from clean install

### 2. Mobile Expo/EAS config
- `mobile/package.json` — Expo SDK 55, React 18.3.1, RN 0.76.7, expo-router 4
- `mobile/app.json` — Expo config (name: Tutor SG, slug: tutor-sg, bundle: com.aaas.tutorsg)
- `mobile/eas.json` — 4 profiles: development (dev client), internal, preview, production
- `mobile/babel.config.js` — babel-preset-expo + reanimated plugin
- `mobile/tsconfig.json` — extends base, `@/*` path alias, includes app/ + src/

### 3. App structure
- `mobile/app/_layout.tsx` — Expo Router root Stack layout
- `mobile/app/index.tsx` — Simple home screen (SafeArea + title)
- `mobile/src/models/homework-feedback.ts` — TS types for homework feedback
- `mobile/src/components/VoiceRecorder.tsx` — Stub component

### 4. TypeScript
- **TypeCheck:** PASS (our files have no errors; pre-existing errors in merged camera/onboarding code from other branches)
- Targeted fix applied: removed unused `React` import in VoiceRecorder.tsx

### 5. Expo config
- **Config validation:** PASS — SDK 55.0.0, bundle com.aaas.tutorsg, plugins expo-router + expo-sqlite

### 6. EAS
- `eas-cli` v18.11.0 installed globally
- EAS not yet logged in (`eas whoami` → "Not logged in") — requires Expo account credentials
- EAS project not yet initialized — requires `eas init` after login

## Prerequisites for actual EAS build

1. **Expo account** — login via `eas login` or set `EXPO_TOKEN`
2. **EAS project init** — `eas init` inside `mobile/` directory
3. **iOS Simulator** — create via Xcode: Settings → Platforms → add simulator
4. **Android emulator** — Android SDK + AVD via Android Studio

## Pre-existing issues (not in this PR's scope)

- `app/(app)/camera.tsx` — references missing `./modules/expo-document-camera` plugin
- `src/onboarding/*` — TS errors from strict mode (unused imports, undefined index types)
- `src/services/*` — TS errors from merged OCR/LLM code

These will be fixed when those feature branches are properly merged and cleaned up.

## Commits

```
08dbeb6 [bee] AAAS-161: Fix EAS build config — SDK 55, eas.json, app.json, babel, tsconfig, gitignore
c56f324 [bee] AAAS-161: Fix merge conflicts in app screens, stub components, tsconfig
```
