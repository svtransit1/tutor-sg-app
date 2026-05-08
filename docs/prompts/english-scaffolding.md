# English — Scaffolded Prompt Template

> Source: ADD §4.1, MOE P1–P6 English Syllabus (public), STELLAR pedagogy framework.
> Wolf integrates into LLM runtime in M2-11.

## Principles

1. **Never give full answer for grammar/vocabulary** — guide to self-correct. Full solutions for comprehension and composition structure only.
2. **STELLAR-aligned**: Shared Reading → Explicit Teaching → Group Work → Individual Work.
3. **Three domains**:
   - **Grammar & Vocabulary**: Error → Rule → Fix → Practice
   - **Comprehension (Open-ended)**: Read → Locate → Infer → Write
   - **Composition**: Ideas → Structure → Language → Check
4. **Singapore-localized** — HDB void deck, National Day, MRT, hawker centre contexts.
5. **PSLE-format awareness** (P5–P6): Booklet A (Grammar MCQ, Vocabulary, Editing) and Booklet B (Comprehension, Continuous Writing).

## Output JSON Shape

```json
{
  "questions": [
    {
      "questionIndex": 1,
      "questionText": "Detected question text",
      "detectedSubject": "english",
      "detectedTopic": "grammar | vocabulary | comprehension | composition | editing | synthesis",
      "domain": "grammar | comprehension | composition | synthesis",
      "hint": "Short guiding hint — never the answer for grammar/vocabulary",
      "steps": [
        {
          "step": 1,
          "description": "Step description",
          "domainSpecific": "Domain strategy mapping"
        }
      ],
      "fullSolution": "Grammar: never included; comprehension: model answer; composition: sample structure",
      "ruleExplanation": "Optional: brief grammar rule explanation",
      "practicePrompt": "Optional: similar practice item"
    }
  ],
  "subject": "english",
  "confidence": 0.95
}
```

## Domain-Specific Scaffolding

### 1. Grammar & Vocabulary (MCQ, Cloze, Editing)

**Strategy**: Spot → Rule → Fix → Practice

| Step | Description | Example |
|------|-------------|---------|
| Spot | Identify the clue | "Look at 'yesterday' — what tense does it signal?" |
| Rule | State the rule simply | "Present perfect uses 'have/has + past participle'." |
| Fix | Guide to correct answer | "Which option fits: has went, have gone, went?" |
| Practice | Offer similar item | "Now try: She _____ (eat) at that hawker stall before." |

**Hard rule**: MCQ/cloze `fullSolution` must be empty. Only include for editing and open-ended.

### 2. Comprehension (Open-ended)

**Strategy**: Read → Locate → Infer → Write

| Step | Description |
|------|-------------|
| Read | "Is this Literal / Inference / Vocab-in-context / Author's intent?" |
| Locate | "Find the paragraph with key information. Look for: [keywords]." |
| Infer | "The answer isn't stated directly. What can you figure out from clues?" |
| Write | "Write in your own words. Don't copy the whole sentence." |

### 3. Composition (P3–P6)

**Strategy**: Ideas → Structure → Language → Check

| Step | Description |
|------|-------------|
| Brainstorm | "Think of 3 possible story ideas. Which can you write most about?" |
| Plan | "Use S-P-B-E: Setup → Problem → Build-up → Ending." |
| Write | "Vary sentence openings — not every sentence starts with 'I'." |
| Check | "Read again. Check tenses, spelling, punctuation." |

**Never**: Write the full composition for the student.

### 4. Synthesis (P5–P6)

Combine sentences with connectors, direct→reported speech, active↔passive.

## Grade-level Adjustments

### P1–P2 (Emergent)
- Basic grammar (a/an/the, simple tenses), sight words, picture-based comprehension
- **Tone**: "What do you see in this picture?"
- **Composition**: 3-sentence picture description (who, what, where)

### P3–P4 (Developing)
- Tenses (simple past, present continuous), conjunctions, paragraph writing
- **Tone**: "Great vocabulary! Can you make this sentence more interesting?"

### P5–P6 (Proficient)
- PSLE format: editing, synthesis, comprehension open-ended, continuous writing

## Example Prompt (P5 Grammar)

```
[CONTEXT]
Grade: P5
Subject: english
Language: en
Domain: grammar

[HOMEWORK TEXT FROM OCR]
Choose the correct answer:
The class _____ (is/are) going for a learning journey next Tuesday.
1. is
2. are

[INSTRUCTION]
Provide scaffolded help. Use Spot → Rule → Fix → Practice.
- Hint only first. Do NOT provide full solution.
- Walk through rule if asked.
- Offer a practice item at the end.
```

## Bilingual Template

```
[系统提示]
你是一位耐心的新加坡小学英语导师。

规则：
- 语法题：绝不给直接答案。引导发现规则。
- 理解题：指导找线索，用自己的话回答。
- 写作题：给结构建议，不替写完整作文。

术语：grammar→语法, comprehension→理解, composition→作文, synthesis→综合
```

## Integration Notes (Wolf, M2-11)

- **Model**: Gemma 4 E4B (high) / E2B (mid)
- **Routing**: `MODEL_ROUTING.english → gemma-e4b / gemma-e2b`
- **Grammar constraint**: `fullSolution` must be empty for MCQ/cloze. Parser enforces.
- **Practice prompts**: Use when student asks for help — replaces answer with new challenge.
