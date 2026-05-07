# AAAS-127 Review Record — Native Module Merge

**Date:** 2026-05-07
**Reviewer:** 🐺 Wolf (merge author)
**Branch:** `wolf/aaas-127-litert-native-module-merged`
**Base:** `owl/aaas-127-litert-native-module` (commit `7fd981695`)
**Commits added:**
- `14d3371a7` — [wolf] AAAS-127: M2-11 — LiteRT-LM/ExecuTorch native module for React Native
- `4a4b0c02e` — [wolf] AAAS-127: add NativeInferenceBridge — adapter for AAAS-44 homework flow

## Changes

| File | Purpose |
|------|---------|
| `mobile/android/.../LLMRuntimeModule.java` | Android native module wrapping LiteRT-LM |
| `mobile/android/.../LLMRuntimePackage.java` | Android package registration |
| `mobile/ios/LLMRuntime/LLMRuntimeModule.h` | iOS native module header (ExecuTorch) |
| `mobile/ios/LLMRuntime/LLMRuntimeModule.m` | iOS native module implementation |
| `mobile/plugins/withLLMRuntime.ts` | Expo config plugin for native module injection |
| `mobile/__mocks__/react-native.ts` | Test mock for NativeModules + NativeEventEmitter |
| `mobile/src/services/llm/types.ts` | LLMRuntime type definitions |
| `mobile/src/services/llm/LLMRuntime.ts` | JS bridge — load/generate/unload/streaming API |
| `mobile/src/services/llm/index.ts` | Public exports |
| `mobile/src/services/llm/__tests__/LLMRuntime.test.ts` | 21 unit tests for JS bridge |
| `mobile/src/services/llm/NativeInferenceBridge.ts` | Adapter from LLMRuntime → @tutor-sg/llm InferenceBridge |
| `mobile/src/services/llm/__tests__/NativeInferenceBridge.test.ts` | 9 unit tests for adapter |
| `mobile/package.json` | Added `@tutor-sg/llm` workspace dependency |

## Merge Notes

- **Conflict resolved:** `mobile/setup-jest.ts` deleted in base (Owl branch migrated to Vitest). Native module mocks will need integration into Vitest setup in a follow-up.
- **Conflict resolved:** `mobile/package.json` — kept Owl's minimal dep set + `@tutor-sg/llm` from incoming.
- **NativeInferenceBridge dependency:** Imports `InferenceBridge`, `buildPrompt`, `parseInferenceResponse`, `resolveModel` from `@tutor-sg/llm` and `DeviceTier` from `@tutor-sg/device-tier`. These types live on the AAAS-44/homework-flow branch and are not yet on `owl/aaas-127-litert-native-module`. The file is forward-looking — it will typecheck when those interfaces land.

## Verification

- **packages/llm tests:** 23/25 pass (2 pre-existing failures: pause/resume race + sequential timeout in Owl's modelManager)
- **TypeScript check (packages/llm):** 3 pre-existing errors in Owl's `expo-adapter.ts` (missing type declarations for `expo-file-system`/`expo-network`)
- **Mobile tests:** Cannot run — no Jest/Vitest config on this branch (mobile test infra was on `feat/aaas-290-testing-infrastructure` which is a separate branch)

## Next Review

🦉 **Owl** should review:
1. Android native module structure (`LLMRuntimeModule.java`)
2. iOS native module structure (`LLMRuntimeModule.m`)
3. Expo config plugin (`withLLMRuntime.ts`)
4. JS bridge API surface (`LLMRuntime.ts`)
