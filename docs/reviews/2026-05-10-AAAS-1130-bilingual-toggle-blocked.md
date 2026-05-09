# Review: AAAS-1130 — M2: Bilingual toggle drives correct LLM model routing

**Reviewer:** Bee
**Date:** 2026-05-10
**Branch:** `feat/aaas-866-bilingual-toggle`
**Author:** Bee

**Verdict: BLOCKED — requires Owl architecture review**

## Verification

- Handoff comment confirms 31 routing tests + 12 hook tests passing
- `resolveModelByLanguage()` in `packages/llm/src/routing.ts` maps EN→Gemma, zh-Hans→Qwen
- `useSessionLanguage` hook connects i18n toggle to model routing

## Decision

Per Fleet Review Protocol §4.1, model routing changes require Owl architecture approval. Bee is not qualified to approve. Assigned to Owl at commit `5f82f00f`.

## Required actions

Owl reviews the `resolveModelByLanguage()` strategy.
