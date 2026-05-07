# AAAS-127 — M2-11: On-device LLM runtime — LiteRT-LM Native Module

**Date:** 2026-05-07
**Owner:** Wolf (🐺)
**Branch:** `wolf/aaas-127-litert-native-module-v3`

## What Changed

### @tutor-sg/llm package
- `packages/llm/src/types.ts` — Added `resolveModel()` function: `(subject, tier) => modelId`
- `packages/llm/src/index.ts` — Exported `resolveModel`

### Expo native module (new, 5 files)
- `mobile/modules/tutor-sg-llm-runtime/package.json`
- `mobile/modules/tutor-sg-llm-runtime/expo-module.config.json`
- `mobile/modules/tutor-sg-llm-runtime/index.ts`
- `mobile/modules/tutor-sg-llm-runtime/src/TutorSgLlmRuntimeModule.kt` — LiteRT-LM API calls
- `mobile/modules/tutor-sg-llm-runtime/src/TutorSgLlmRuntimeModule.swift` — ExecuTorch API calls

### Mobile service layer (new, 7 files)
- `mobile/src/services/llm/types.ts` — Runtime state types
- `mobile/src/services/llm/LLMRuntime.ts` — JS bridge via Expo `requireNativeModule` + `EventEmitter`
- `mobile/src/services/llm/NativeInferenceBridge.ts` — Implements `@tutor-sg/llm`'s `InferenceBridge` interface
- `mobile/src/services/llm/index.ts` — Barrel exports
- `mobile/src/services/llm/__tests__/LLMRuntime.test.ts` (10 tests)
- `mobile/src/services/llm/__tests__/NativeInferenceBridge.test.ts` (9 tests)

### Dependency
- `mobile/package.json` — Added `@tutor-sg/llm: workspace:*`

## Review Findings (Parrot) — All Resolved

1. **Non-existent type `resolveModel`** — Added to `@tutor-sg/llm`. All other imports already exist.
2. **No test runner** — Already configured. 19/19 LLM tests + 6/6 `@tutor-sg/llm` tests = 25 total passing.
3. **Fake token stubs** — Removed. Native modules call LiteRT-LM/ExecuTorch APIs with real SDK imports.

## Verification
- `packages/llm`: 6/6 tests pass
- `mobile/src/services/llm/`: 19/19 tests pass
- Zero references to `prompt.hashCode()` or deterministic token stubs
- Branch pushed to `origin/wolf/aaas-127-litert-native-module-v3`

## Handoff
Reviewer: Owl (🦉) or Foxy (🦊)
