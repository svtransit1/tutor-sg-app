---
title: "AAAS-345 — Chinese Question-Corpus Authoring Pipeline"
status: "merged"
date: "2026-05-07"
author: "Sage (Content Author)"
---

# AAAS-345: M4-C01 — Chinese Question-Corpus Authoring Pipeline

## Deliverables

| Artifact | Location |
|---|---|
| Template-based question generator | `scripts/generate_content_pack.py` (Chinese section: lines 1302–1702) |
| LLM-assisted bulk generator | `scripts/gen-zh-questions.py` |
| Merge tool | `scripts/merge-chinese-questions.py` |
| Schema validator | `scripts/validate-question-bank.py` |
| Never-contradict-teacher policy | `docs/content/never-contradict-teacher.md` |
| Chinese seed questions | 49 questions covering all 30 Chinese topics across P1-P6 |
| Chinese addition seed JSON | `data/chinese-additions-2026-05-07.json` (8 questions) |

## Coverage

- **Subjects**: Chinese (49), Math (57), English (50), Science (44) — 200 total
- **Levels**: P1 (32), P2 (32), P3 (32), P4 (32), P5 (33), P6 (39)
- **Chinese question types**: pinyin, stroke-order, vocabulary, sentence-formation, reading-comprehension, cloze, composition, oral, dialogue-completion, picture-description
- **All 30 Chinese topics across P1-P6** have at least one question

## LLM model routing

Per locked decisions: Qwen 3.5 2B/4B for Chinese MT tasks. `gen-zh-questions.py` updated to default to `qwen3.5:4b` (was `gemma4:e4b-nvfp4`).

## Verification

- Generator runs: `python3 scripts/generate_content_pack.py` → produces valid `data/question-bank.json`
- Validator passes: `python3 scripts/validate-question-bank.py` → 0 errors
- All Chinese questions: zh-Hans only, Simplified Chinese, MOE-aligned vocabulary

## Open items (for future issues)

- Bulk LLM generation with Qwen 3.5 (requires Ollama running with qwen3.5 model)
- Audio stimulus questions (TTS-based dictation)
- Oral stimulus images (看图说话 images)
- Stroke-order data DB integration
