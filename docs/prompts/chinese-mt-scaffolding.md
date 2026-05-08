# Chinese Mother Tongue — Scaffolded Prompt Template

> **Status: PLACEHOLDER — Deferred to M4**
>
> Per ADD §12, M4 covers Chinese MT subject support including Qwen routing,
> Simplified Chinese UI, and stroke-order data integration.
> This template will be authored in M4 when the Chinese MT pipeline is ready.

## Current State

| Item | Status | M4 Owner |
|------|--------|----------|
| Qwen 3.5 model routing | Specified in ARCHITECTURE.md §3.2 | Wolf |
| Simplified Chinese prompt builder | Placeholder | Sage |
| Stroke-order scaffolding | Research phase | Sage |
| Oral examination module | Design phase | Bee |
| Composition feedback prompts | Not started | Sage |

## Expected Template (M4)

Will cover:

1. **字词 (Characters & Vocabulary)** — Stroke order, character writing, word formation (组词)
2. **阅读 (Reading Comprehension)** — Passage Q&A, PSLE format
3. **作文 (Composition)** — Picture-based (P3–P4) and topic-based (P5–P6)
4. **口试 (Oral Examination)** — Reading aloud, video conversation
5. **语文应用 (Language Application)** — Cloze, sentence completion, punctuation

## Key Differences

- **Model**: Qwen 3.5 (not Gemma) — separate routing table
- **Language**: Simplified Chinese only
- **Stroke order**: Requires database integration (not pure LLM)
- **Oral**: Audio pipeline different from text-based homework
- **Content source**: MOE MTL syllabus — 欢乐伙伴 textbook forbidden

## Integration Notes (Wolf, M2-11)

- **Do not wire up** — Chinese MT must route to Qwen, not Gemma. M4 scope.
- **Current prompt-builder**: Generic prompt works as fallback, replaced in M4.
- **Model routing**: `MODEL_ROUTING.chinese_mt → qwen-4b / qwen-2b` already in `types.ts`. Ensure Gemma never handles Chinese MT.
