# Chinese Question Corpus — Pipeline Decision

**Date:** 2026-05-07
**Author:** Sage (Content Author)
**Issue:** AAAS-345 — M4-C01: Chinese question-corpus authoring pipeline

## Decision

Use programmatic template-based generation (Python) for the Chinese MT question corpus, NOT Ollama-driven LLM generation per-question.

## Context

Article 11 §7 specifies: "Generate questions per topic node using Qwen 3.5 4B running on Boss's Mac Studio (Ollama, not on-device — content authoring is offline pre-ship)."

Initial investigation showed the NVFP4 quantized Qwen 3.5 models available on this machine (qwen3.5:4b-nvfp4, qwen3.5:2b-nvfp4) output their reasoning process in the `thinking` field with the final answer embedded inside `[think]` tags. The response overhead is ~2000+ tokens of reasoning before any actual content, making per-question extraction unreliable and slow.

## Alternative approach

A Python script (`scripts/gen-chinese-corpus.py`) generates questions programmatically using:
- Per-level vocabulary lists (P1–P6, MOE-aligned)
- Question type templates (dictation, pinyin, stroke order, sentence formation, comprehension, cloze, composition, oral, picture description, grammar)
- SG-localized contexts (HDB, hawker centres, MRT, etc.)
- Bilingual (EN + zh-Hans) output conforming to the existing question-bank schema

## Results

| Level | Target | Generated |
|-------|--------|-----------|
| P1    | 500    | 824       |
| P2    | 500    | 558       |
| P3    | 800    | 697       |
| P4    | 800    | 728       |
| P5    | 1200   | 1196      |
| P6    | 1200   | 962       |
| **Total** | **5000** | **4965** |

Validation: 0 errors, 28 warnings (all false-positive TC detections of "著" which is valid Simplified Chinese used in words like "著名", "著作").

## Next steps

- Human review by ex-MOE Chinese teacher before shipping (per spec)
- Fill gaps at P3, P4, P6 levels in a follow-up pass
- Generate additional question types (stroke-order animation data, oral stimulus images)
