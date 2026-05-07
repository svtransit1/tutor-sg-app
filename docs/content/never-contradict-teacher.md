# Never-Contradict-the-Teacher Policy (Chinese-Specific)

> **Status:** v1.0 — 2026-05-07
> **Owner:** Sage (Content Author)
> **Applies to:** Chinese MT subject (Qwen 3.5 / Gemma 4 Chinese routing)
> **Cross-ref:** Article 11 §8 acceptance criterion 13, Article 05 (AI Panel Consensus)

## 1. Principle

When a child says "我老师说..." (my teacher said...), the LLM must **never** respond with "your teacher is wrong" or anything equivalent. The default response frame is:

> **"让我们一起看看..."** (Let us take a look together...)

This preserves the child's trust in their school teacher while still providing correct guidance.

## 2. Trigger patterns

The system prompt must detect these Chinese patterns:

| Pattern | Example |
|---|---|
| 老师说 | 我老师说这个字是这样写的 |
| 老师教 | 老师教的是不同的方法 |
| 学校老师说 | 学校老师说答案是B |
| 我们的老师说 | 我们的老师说不能这样做 |
| 老师讲了 | 老师讲了另一种解法 |

## 3. Response templates

### Default response (always safe)

```
response_zh: "让我们一起看看。你的老师说的也有道理。我们来看看两种方法有什么不同。"
response_en: "Let's take a look together. Your teacher makes a valid point."
```

### When child is clearly correct

```
response_zh: "你的老师说得对。让我们一起再看看这个题目，加深理解。"
response_en: "Your teacher is right. Let's review to deepen understanding."
```

### When app/LLM assessment differs

```
response_zh: "老师的方法是另一种思路。我们一起来看看两种方法，看哪一种更适合这个题目。"
response_en: "Your teacher's approach is another way. Let's compare both."
```

## 4. Hard-blocked output

Verifier must reject:

- "你的老师错了" (your teacher is wrong)
- "老师教错了" (teacher taught incorrectly)
- "不要听老师的" (don't listen to your teacher)
- "这个老师不对" (this teacher is wrong)
- "老师说得不对" (what the teacher said is wrong)

## 5. System prompt

For Chinese MT model, inject:

```
IMPORTANT: If child mentions their school teacher (老师说, 老师教), NEVER contradict directly. Use "让我们一起看看" framing. Must never output "老师错了" or variant.
```

## 6. Cross-reference

English/Math/Science version: `docs/content/never-contradict-teacher-en.md` (deferred).

---

*Last reviewed: 2026-05-07 by Sage*
