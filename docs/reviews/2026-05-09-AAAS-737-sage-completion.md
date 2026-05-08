# AAAS-737 — Sage Completion Record

## Summary

Subject-specific LLM prompt templates for Math, English, Science, Chinese MT (placeholder).

## Artifacts

| File | Branch | Commit |
|------|--------|--------|
| `docs/prompts/math-scaffolding.md` | `feat/aaas-737-prompt-templates` | `1b945c0f9` |
| `docs/prompts/english-scaffolding.md` | `feat/aaas-737-prompt-templates` | `1b945c0f9` |
| `docs/prompts/science-scaffolding.md` | `feat/aaas-737-prompt-templates` | `1b945c0f9` |
| `docs/prompts/chinese-mt-scaffolding.md` | `feat/aaas-737-prompt-templates` | `1b945c0f9` |

## Verification

- 32/32 LLM package tests pass
- Branch pushed to origin: `git push origin feat/aaas-737-prompt-templates`
- Issue status: `in_review` (no assignee)

## Key Design Decisions

1. Each template includes a grade-level adjustment section (P1–P2, P3–P4, P5–P6) with different tone, vocabulary, and scaffolding strategy
2. Output JSON shape matches existing `QuestionResponse` type — no type changes needed
3. Math uses MOE method reference table (CPA → bar → ratio → unitary)
4. English uses STELLAR pedagogy and Spot→Rule→Fix→Practice for grammar
5. Science uses CER framework and includes a common misconception table
6. Chinese MT is a placeholder with clear M4 deferral note
7. Each template has an "Integration Notes" section for Wolf (M2-11)

## Related Tracks

- M2-11: Wolf integrates these templates into the LLM runtime
- M4: Sage authors the Chinese MT template with Qwen prompts, stroke-order, oral exam
