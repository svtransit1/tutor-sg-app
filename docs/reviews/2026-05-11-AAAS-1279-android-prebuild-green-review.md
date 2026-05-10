# Review: AAAS-1279 — M0-102: Android prebuild green

**Reviewer:** Wolf
**Date:** 2026-05-11
**Branch:** `feat/aaas-1279-android-prebuild-green`
**Author:** Wolf

**Verdict: APPROVED**

## Verification

- Config fix: `mobile/app.config.ts` — `googleServicesFile` now returns `undefined` when the file is absent (uses `existsSync` gate)
- Gitignore updated: `.gitignore` — added `google-services*.json` and `GoogleService-Info*.plist`
- Placeholder assets: `mobile/assets/{icon,adaptive-icon,splash}.png` exist (solid-color PNGs)
- BUILD.md created: platform prerequisites, env vars, troubleshooting
- Build executed: `npx expo run:android` in `mobile/`
- Gradle result: `BUILD SUCCESSFUL` — 183 actionable tasks, no red compile errors
- APK produced: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- APK installed: on emulator `tutor-sg-api35`

## Changes

| File | Change |
|------|--------|
| `mobile/app.config.ts` | `googleServicesFile` now conditional: returns path only when file exists |
| `.gitignore` | Added Firebase config files to secrets block |
| `mobile/assets/*.png` | Placeholder icon/splash/adaptive-icon PNGs |
| `BUILD.md` | Created with Android + iOS prerequisites, dev steps, troubleshooting |

## Escalation

Not required. Ready for QA review (Tortoise).
