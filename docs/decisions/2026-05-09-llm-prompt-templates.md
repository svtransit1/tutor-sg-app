# Decision: LLM Prompt Templates for Homework Help (AAAS-924 / M2-114)

**Date:** 2026-05-09
**Author:** Wolf
**Status:** locked

## Context

M2-114 required implementing LLM prompt templates that enforce the hint-first scaffolded approach for the homework camera flow. Per ADD §4.1: "Default behavior: hint first, never show full answer until kid asks."

## Decisions

### 1. Package location: `packages/llm/`

The prompt templates live in the `packages/llm/` package (scoped as `@tutor-sg/llm`). This is separate from the mobile app code so:
- Templates can be versioned and tested independently
- Future packages (CLI generators, content tools) can reuse them
- The mobile app imports via workspace dependency

### 2. Prompt architecture: System + User split

Each prompt is built as a `{ system, user }` pair:
- **System prompt** — encodes all behavioral rules (tone, scaffolding, grade level, subject adaptation)
- **User prompt** — contains the actual question text and any contextual instructions

This matches the Gemma chat template format (system context + user turn).

### 3. Three-level scaffolding baked into the system prompt

The system prompt instructs the LLM to produce three levels in a single JSON output:
1. `hint` — guiding question, never the answer
2. `guidedSteps` — numbered breakdown, 2-5 steps
3. `workedSolution` — full working with reasoning

The existing `ScaffoldedHelp` TypeScript interface (`mobile/src/models/homework-feedback.ts`) already defines this shape. The prompt templates generate output compatible with it.

### 4. Subject-specific adapters

Four subject adapters with different pedagogical approaches:
- **Math**: step-by-step working, model drawing for P1-P4, no algebra before P5
- **English**: grammar rule identification, comprehension clue-finding, no full compositions
- **Science**: Claim-Evidence-Reasoning (CER) framework, variable identification
- **Chinese MT**: Simplified Chinese only, pinyin support, stroke/radical hints

Each adapter includes example hints and explicit forbidden patterns.

### 5. Bilingual prompt templates

All templates exist in both `en` and `zh-Hans`. The language is selected at prompt-build time via `PromptContext.language`. Section headers, rules, and encouragement phrases are all localized.

### 6. Grade-level language adaptation

Three bands:
- **P1-P2** (Lower Primary): very simple words, concrete examples, max 2-3 steps
- **P3-P4** (Middle Primary): clear straightforward language, 3-4 steps
- **P5-P6** (Upper Primary): precise academic language, 3-5 steps, PSLE alignment

### 7. Progressive disclosure enforced at prompt level

The prompt always generates all three levels, but the `requestedLevel` field tells the LLM which level to emphasize. The UI enforces the tab system (hint → steps → solution). Both layers (prompt + UI) prevent answer-first behavior.

### 8. Kid-safe tone rules

Hard-coded into every system prompt:
- Never say "wrong", "incorrect", or "bad"
- Praise effort, not correctness
- Use encouragement phrases (localized per language)
- Guide through questions, don't dictate answers
- Singapore-local examples (HDB, MRT, hawker centre)

### 9. No cloud references

The system prompts contain zero references to cloud, server, upload, remote, online, API, or internet. This aligns with the on-device-only privacy architecture.

## Implementation

- **Package:** `packages/llm/` (`@tutor-sg/llm`)
- **Entry point:** `src/index.ts` exports `buildHomeworkHelpPrompt`, `buildHomeworkHelpSystemPrompt`, `buildHomeworkHelpUserPrompt`
- **Tests:** 56 unit tests covering all subjects × languages × grades, scaffold levels, previous attempts, privacy constraints
- **TypeScript:** strict mode, compiles cleanly

## Output format

```json
{
  "hint": "string",
  "guidedSteps": ["string", "string", ...],
  "workedSolution": "string"
}
```

This matches `mobile/src/models/homework-feedback.ts` `ScaffoldedHelp` type exactly.

## Cross-references

- ADD §4.1 — Camera homework check flow
- Architecture §4.1 — Homework photo pipeline (Stage 2: Gemma semantic analysis)
- DeepTutor article 04 — Pattern 2: Plan → Steps → Final single-pass structured output
- `mobile/src/models/homework-feedback.ts` — `ScaffoldedHelp` type
- `mobile/src/components/HomeworkFeedbackCard.tsx` — UI component consuming this shape
