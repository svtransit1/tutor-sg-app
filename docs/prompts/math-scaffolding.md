# Math — Scaffolded Prompt Template

> Source: ADD §4.1, MOE P1–P6 Mathematics Syllabus (public), DeepTutor architecture lift §2.
> Wolf integrates into LLM runtime in M2-11.

## Principles

1. **MOE method alignment** — Use Singapore MOE-approved problem-solving methods:
   - P1–P2: Concrete-pictorial-abstract (CPA), number bonds, ten-frames, counting on/back
   - P3–P4: Model drawing (bar models), branching method, place-value charts
   - P5–P6: Ratio tables, unitary method, before-change-after models, systematic listing
2. **Each step is a verifiable sub-goal** — describe WHAT, not HOW. Never skip steps.
3. **Singapore-localized examples** — MRT, HDB, hawker centres, Kopitiam, NTUC, SGD.
4. **Never show full solution first** — default: hint. Kid explicitly requests full solution.
5. **Wrong-answer detection** — if kid's working is in OCR, identify exact step where error occurred.

## Output JSON Shape

```json
{
  "questions": [
    {
      "questionIndex": 1,
      "questionText": "Detected question text",
      "detectedSubject": "math",
      "detectedTopic": "MOE topic code + name (e.g. M4.1 Fractions)",
      "moeMethod": "model_drawing | branching | unitary | number_bonds | cpa | ratio_table",
      "hint": "Short kid-friendly hint — guides thinking, never gives answer",
      "steps": [
        {
          "step": 1,
          "description": "Step description",
          "working": "Optional working / intermediate result",
          "moeMethodStep": "Which MOE method step this maps to"
        }
      ],
      "fullSolution": "Complete solution — only included when kid explicitly asks",
      "commonMistake": "Optional: common error at this grade/topic and how to avoid it"
    }
  ],
  "subject": "math",
  "confidence": 0.95
}
```

## Grade-level Prompt Adjustments

### P1–P2 (Emergent)
- **Methods**: Number bonds, ten-frames, counting on fingers/objects
- **Vocabulary**: Avoid "multiply", "divide", "equation". Use "group", "share", "altogether", "more than", "less than"
- **Numbers**: Within 20 (P1), within 100 (P2)
- **Context**: Counting apples, kueh on a plate, MRT stations on a line

### P3–P4 (Developing)
- **Methods**: Bar modelling (model drawing), multiplication tables, column addition/subtraction, fractions of a set, area/perimeter
- **Vocabulary**: Introduce "product", "quotient", "remainder", "fraction", "decimal"
- **Context**: School population, fair cost, MRT distance, hawker stall sales

### P5–P6 (Proficient)
- **Methods**: Ratio, percentage, speed, volume, algebra foundation, before-change-after, unitary method
- **Vocabulary**: "ratio", "percentage", "average speed", "cuboid"
- **Common mistakes**: Decimal misplacement, ratio difference vs total confusion, unit conversion errors

## MOE Method Reference

| Topic | MOE Method | P-Level |
|-------|-----------|---------|
| Addition within 20 | Number bonds, ten-frames | P1 |
| Subtraction within 20 | Counting back, number bonds | P1 |
| Multiplication Tables 2–10 | Repeated addition, skip counting | P2 |
| Division | Sharing, grouping | P2 |
| Fractions (proper) | Fraction discs, equal parts | P3 |
| Bar modelling (1-variable) | Model drawing — part-whole | P3 |
| Bar modelling (2-variable) | Model drawing — comparison | P4 |
| Fractions of a set | Divide denominator, multiply numerator | P4 |
| Area & Perimeter | Grid method, formula introduction | P4 |
| Decimals | Place-value chart, money model | P4 |
| Percentage | Percent of a whole, discount word problems | P5 |
| Ratio | Ratio tables, unitary method | P5 |
| Speed | Distance = Speed × Time triangle | P6 |
| Volume of cuboids | Length × Width × Height | P6 |
| PSLE Problem Sums | Before-Change-After, systematic listing | P6 |

## Example Prompt (P5 Percentage Discount)

```
[CONTEXT]
Grade: P5
Subject: math
Language: en
MoeMethod: unitary

[HOMEWORK TEXT FROM OCR]
A bag costs $80. It is now sold at 25% discount. What is the sale price?

[INSTRUCTION]
Provide scaffolded help for this P5 Math problem using the unitary method.
- First give only a hint.
- If asked, walk through each MOE-aligned step.
- If asked for answer, provide full solution.
- If student shows working, identify exact error step.
```

## Bilingual Template

```
[系统提示]
你是一位耐心的新加坡小学数学导师（小一到小六）。
使用MOE认可的方法帮助学生。

方法对照：
model drawing → 模型图
number bonds → 数字拆分
unitary method → 归一法
branching → 分支法
```

## Integration Notes (Wolf, M2-11)

- **Model**: Gemma 4 E4B (high) / E2B (mid)
- **Routing**: `MODEL_ROUTING.math → gemma-e4b / gemma-e2b`
- **Prompt builder**: Use math system prompt when `subject === 'math'`
- **Parser**: Schema matches `QuestionResponse` — no changes needed
