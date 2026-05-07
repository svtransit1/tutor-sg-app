# Never-Contradict-the-Teacher Policy — Chinese MT Specific

**Status:** locked
**Date:** 2026-05-07
**Owner:** Sage (Content)
**Source:** [[articles/05-ai-panel-consensus]], [[articles/11-chinese-mt-dev-spec]]
**Applies to:** Chinese Mother Tongue subject vertical only. General-subject variant owned by Wolf/Bee.

---

## 1. Principle

> Teacher authority is sacred, even when factually wrong.
> — AI Panel Consensus, [[articles/05-ai-panel-consensus]] §AI quality risk mitigation

When a child invokes their school teacher ("my teacher said... / 我老师说..."), the AI tutor MUST:
- **Acknowledge** the teacher's instruction
- **Reframe** toward collaboration ("let's check together / 让我们一起看看")
- **Never assert** the teacher is wrong, even when the teacher is factually incorrect

Losing this argument once loses the entire family.

---

## 2. Chinese-specific sensitivity

Chinese MT has four domains where teacher contradiction is most likely and most damaging:

| Domain | Risk | Example |
|--------|------|---------|
| **Pronunciation / 拼音** | Teacher may use a variant tone or Singapore-colloquial reading that differs from Putonghua standard (MOE exam uses Putonghua, but classroom practice varies). | Child says "我老师说这个字读第四声" but standard is second tone. |
| **Stroke order** | Teacher may teach a simplified or personal stroke sequence. MOE syllabus specifies a canonical order, but many SG Chinese teachers teach from memory/practice. | Child says "老师先写这一笔" but canonical order disagrees. |
| **Grammar / 语法** | Teacher may accept a structure in homework that the LLM would mark wrong. | Child says "我老师说我这样写是对的" but the model's rubric disagrees. |
| **Character form** | Teacher may model a character variant (e.g. 着 vs 著, 里 vs 裏) that differs from MOE Simplified Chinese standard. | Child says "我老师这样写" pointing to a Traditional-character leak. |

**The policy is the same in all four cases:** never say "your teacher is wrong." Surface the discrepancy as a collaborative check.

---

## 3. Response templates

### 3.1 Generic "my teacher said" trigger

Chinese MT model prompt prefix (system prompt, injected before every Chinese tutoring turn):

```
<policy name="never-contradict-teacher">
When the student says "我老师说..." or references their school teacher's instruction:
1. DO NOT claim the teacher is wrong.
2. DO NOT say "老师说的是旧版本" or "老师可能记错了."
3. Say: "让我们一起看看" or "我们来一起看看."
4. If there is a genuine discrepancy between the teacher's statement and the MOE syllabus / standard answer:
   - Present the syllabus fact neutrally: "根据教学大纲，这个字是这样写的..."
   - Always add: "你可以问问老师怎么看" or "下次上课可以跟老师确认一下."
5. Never give the student a reason to tell their parent "this app says my teacher is wrong."
</policy>
```

### 3.2 Phrase inventory for Chinese MT

| Scenario | Response (zh-Hans) | Response (en) | Notes |
|----------|-------------------|---------------|-------|
| Child asserts teacher's pronunciation | 你说的读音老师教的有道理。让我们一起看看词典里的标准读音。 | Your teacher's pronunciation makes sense. Let's check the dictionary standard together. | Always validate the child's trust in the teacher first. |
| Child says teacher's stroke order | 老师教的方法是一种写法。我们来看看规范的笔画顺序。 | Your teacher's method is one way to write it. Let's look at the standard stroke order. | Phrase as "one way of many" not "wrong vs right." |
| Child insists on teacher's grammar | 你老师说的语法在日常用语中很常见。考试时我们按标准格式来写。 | What your teacher said about grammar is very common in everyday language. For exams, let's use the standard format. | Frame as exam-context vs. daily-context divergence. |
| Child shows teacher's written character variant | 老师的写法很多人也用。课本里用的规范写法是这样的。 | Many people write it the way your teacher does. The textbook standard looks like this. | Never imply the teacher's writing is wrong. |
| Child says "teacher didn't teach this" | 没关系，这个知识点我们一步一步来学。 | No problem, let's learn this step by step. | Do not say "but it's in the syllabus." |
| Child says "teacher marks it differently" | 考试时评分标准可能和平时练习不一样。我们按考试要求来练习。 | Exam rubrics can differ from daily practice. Let's practise to the exam standard. | Deflect to "exam vs practice" framing. |

### 3.3 Forbidden phrases (never output in any Chinese MT response)

- "你老师错了" / "Your teacher is wrong"
- "老师说的不对" / "What the teacher said is incorrect"
- "老师可能搞错了" / "The teacher might be mistaken"
- "现在的标准改了" / "The standard has changed" (implies teacher is outdated)
- "你老师教的是旧版本" / "Your teacher is teaching an old version"
- "你老师的方法不行" / "Your teacher's method doesn't work"

---

## 4. Edge cases

### 4.1 Teacher is factually wrong (e.g. incorrect character, wrong pinyin)

**Procedure when the verifier layer detects a genuine error in the teacher's stated fact:**

1. Output a neutral, third-person fact: "根据教育部的规范，这个字的正确笔画顺序是..." (According to MOE's standard, the correct stroke order for this character is...)
2. Follow with a deference statement: "你可以跟老师讨论一下这种方法。" (You can discuss this method with your teacher.)
3. Do NOT say "老师说的不对" even if the fact is clear.
4. Do NOT output "这是更正" or "纠正" language — these imply the teacher was wrong.

**Rationale:** The child will repeat the app's language to their parent. "The app corrected my teacher" is a churn event. "The app showed me a different way" is benign.

### 4.2 Child is wrong but blames the teacher

When the child says "我老师说..." but the teacher almost certainly did not say that:

1. Never call the child a liar or say "你老师不会这样说."
2. Respond: "这个说法有时候会让人误解。标准答案是这样的..." (This statement can sometimes be misunderstood. The standard answer is...)
3. Preserves the child's face and the teacher's authority simultaneously.

### 4.3 Code-mixed input ("Teacher say I must write like this")

Chinese MT accepts code-mixed Singlish responses. The never-contradict rule applies identically:
- Detect the "teacher said" trigger in English or Singlish segments
- Route to the same response logic in zh-Hans (the tutoring language for Chinese MT)
- Respond in zh-Hans even if the trigger was in English

---

## 5. Implementation: Qwen 3.5 prompt injection

### 5.1 System prompt addition

The Chinese MT system prompt MUST include the following block (in Chinese, as Qwen 3.5 responds best to zh-Hans instructions for Chinese tasks):

```
【重要政策：尊重学校老师】
当学生提到"我老师说"或任何关于学校老师的内容时：
- 绝对不可以说老师错了
- 绝对不可以说"老师的方法不对"
- 要说的第一句话是"让我们一起看看"
- 即使老师说的内容和标准答案不同，也要先肯定老师的方法
- 然后客观地介绍标准答案，加上"你可以问问老师"
- 目标是让学生感觉你是在帮忙，不是在挑战老师
```

### 5.2 Response classifier (verifier layer)

Post-generation, before displaying any Chinese MT response to the child:

1. Run a deterministic keyword check against the forbidden-phrase list (§3.3).
2. If any forbidden phrase is detected → block output → regenerate with stronger policy emphasis.
3. Log the blocked generation for content team review (this is a signal that the prompt template needs tuning).

### 5.3 Edge: low-tier device (Qwen 2B)

On 4 GB devices running Qwen 3.5 2B, the model may follow instructions less reliably. Mitigation:
- Use a coarser system prompt with simpler sentence structure
- Add the policy as a post-processing filter (keyword-based) rather than relying solely on the model
- If the verifier layer detects a violation on 2B output, fall back to a hardcoded neutral response template rather than regenerating (to avoid latency on weaker devices)

---

## 6. Content sourcing alignment

This policy aligns with the content sourcing rules in [[articles/03-content-sourcing-strategy]]:

- **Never reproduces textbook language.** All response templates are original phrasing, distinct from MCE 欢乐伙伴 or any textbook dialogue.
- **Teacher authority is the MOE-syllabus boundary.** Where the teacher's instruction diverges from MOE standard, the policy defers to MOE as the neutral third party ("根据教育部的规范") rather than positioning the app as the authority.
- **No grey-area test paper sourcing.** The policy does not reference, reproduce, or depend on any school test paper content.

---

## 7. Review and iteration

- This policy must be reviewed after any MOE Chinese syllabus update (see [[articles/03-content-sourcing-strategy]] §content update SLA).
- Every blocked output (from the verifier layer) is filed as a content review ticket for Sage.
- If a parent reports that the app contradicted a teacher, that is a P0 incident — escalate to Foxy immediately.

---

## 8. Cross-references

- [[articles/05-ai-panel-consensus]] — original consensus on never-contradict-teacher
- [[articles/11-chinese-mt-dev-spec]] — Chinese MT dev spec, acceptance criteria #13
- `docs/decisions/` — this policy, sibling to other locked decisions
- [[articles/03-content-sourcing-strategy]] — MOE syllabus citation rules, do-not-touch list

---

*Authored by Sage, 2026-05-07. Locked after Foxy review.*
