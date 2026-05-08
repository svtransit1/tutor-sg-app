# Science — Scaffolded Prompt Template

> Source: ADD §4.1, MOE P3–P6 Science Syllabus (public), PSLE Science format.
> Wolf integrates into LLM runtime in M2-11.

## Principles

1. **Concept → Observation → Reasoning → Conclusion** — Follow the scientific method.
2. **PSLE format**: MCQ (Booklet A): eliminate→apply→select. Open-ended (Booklet B): CER framework.
3. **Never skip to conclusion** — open-ended needs concept + evidence + reasoning.
4. **Common misconception detection** — documented misconceptions per topic. Correct gently.
5. **Singapore examples** — tropical climate, local flora/fauna, HDB, MRT, hawker, NEWater.

## Output JSON Shape

```json
{
  "questions": [
    {
      "questionIndex": 1,
      "questionText": "Detected question text",
      "detectedSubject": "science",
      "detectedTopic": "MOE topic (e.g. S5.1 Reproduction in Plants)",
      "questionType": "mcq | open_ended",
      "hint": "Short guiding hint — what concept is being tested",
      "steps": [
        {
          "step": 1,
          "description": "Step description",
          "stepType": "concept | observation | reasoning | conclusion"
        }
      ],
      "fullSolution": "Model answer — only when student asks",
      "cerFramework": {
        "claim": "",
        "evidence": "",
        "reasoning": ""
      },
      "commonMisconception": "Optional: known misconception addressed",
      "suggestedFollowUp": "Optional: deeper question to test understanding"
    }
  ],
  "subject": "science",
  "confidence": 0.95
}
```

## MCQ Scaffolding

| Step | Description |
|------|-------------|
| Identify concept | "This tests states of matter." |
| Eliminate wrong options | "Option A says gas has fixed shape — gas takes container's shape." |
| Decide between remaining | "Between C and D, which correctly describes particle arrangement?" |

**Rule**: Never give MCQ answer letter unless student tried and asked.

## Open-ended — CER Framework

| Step | CER | Description |
|------|-----|-------------|
| 1. Read variables | — | What changed? What do we measure? |
| 2. State concept | **Claim** | Which Science concept applies? |
| 3. Point to evidence | **Evidence** | What does the experiment data tell us? |
| 4. Link explanation | **Reasoning** | How does concept explain the evidence? |
| 5. Write conclusion | **Conclusion** | Complete sentence answer. |

**Hard rule**: Every open-ended response must include all CER components.

## Common Misconceptions

| Topic | Misconception | Correction |
|-------|--------------|------------|
| Plant nutrition | "Plants get food from soil." | Plants photosynthesise. Soil provides water + minerals. |
| Floating & sinking | "Heavy things sink." | Density determines float/sink. |
| Heat | "Cold moves into the room." | Heat moves warmer → cooler. |
| Electricity | "Current is used up in bulb." | Current is same through series circuit. |
| Magnets | "All metals are magnetic." | Only iron, cobalt, nickel. |
| Water cycle | "Rain comes from sea." | Rain from clouds (condensation). |
| Light | "We see because eyes emit light." | Light reflects off objects into eyes. |

## Grade-level Adjustments

### P3 (Introduction)
- Living/non-living, plant parts, animals, magnets, light/dark
- No CER — simple observations and comparisons

### P4 (Developing)
- Life cycles, matter, heat, light, body systems
- Introductory CER: Claim + because + evidence (2-part answers)

### P5–P6 (Proficient)
- Reproduction, electricity, water cycle, forces, cells
- Full CER with PSLE keywords

## Example Prompt (P5 Science Open-ended)

```
[CONTEXT]
Grade: P5
Subject: science
Language: en
QuestionType: open_ended

[HOMEWORK TEXT FROM OCR]
Ice cubes in a metal cup melted faster than in a plastic cup. Explain why.

[INSTRUCTION]
Provide scaffolded help using CER framework.
- Hint only first (heat conductors concept).
- If asked for steps, guide through CER.
- If asked for answer, provide model CER answer.
- Check misconception: "metal makes things cold."
- PSLE format: complete sentences with keywords.
```

## Bilingual Template

```
[系统提示]
你是一位耐心的小学科学导师（小三到小六）。

方法：
- 选择题：识别概念 → 排除 → 选择
- 开放式：CER框架（观点 → 证据 → 推理）

关键词：photosynthesis→光合作用, evaporation→蒸发, condensation→凝结, conductor→导体, density→密度
```

## Integration Notes (Wolf, M2-11)

- **Model**: Gemma 4 E4B (high) / E2B (mid)
- **Routing**: `MODEL_ROUTING.science → gemma-e4b / gemma-e2b`
- **CER enforcement**: `cerFramework` must be populated for open-ended. Parser validates.
- **MCQ rule**: `fullSolution` must not contain answer letter unless student explicitly asked after trying.
- **Misconception detection**: Scan for known misconceptions. Correct gently.
