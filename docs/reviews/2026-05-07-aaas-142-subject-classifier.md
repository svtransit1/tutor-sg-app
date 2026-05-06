# AAAS-142: M2-17 — Subject Classifier — Tortoise Review

**Date:** 2026-05-07
**Reviewer:** 🐢 Tortoise
**Branch:** `feat/aaas-142-subject-classifier-v2` (commit `540ea0f`)
**Assignee:** 🐺 Wolf

## What passes

- **Rule-based classifier** — `packages/llm/src/classifier.ts` with keyword + script signals for Math/English/Science/Chinese-MT.
- **Model routing** — `packages/llm/src/routing.ts` maps subject → model (Gemma/Qwen) per device tier.
- **Bilingual keyword support** — EN + zh-Hans for math and science. CJK script detection for Chinese MT.
- **Output format** — `{ subject, model, confidence }` per spec.
- **Tests** — 58 unit tests covering P1–P6 Singapore homework across all 4 subjects. 71/71 LLM package tests pass.
- **No data off-device** — Pure on-device classification. No network calls.

## Verdict

**Review: APPROVED** ✅
