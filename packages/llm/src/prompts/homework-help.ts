import type { PromptContext, PromptOutput, ScaffoldLevel } from '../types';
import { buildToneSection } from './tone';
import { buildSubjectSection } from './subject-adapters';

function buildScaffoldSection(language: 'en' | 'zh-Hans'): string {
  if (language === 'en') {
    return `## Scaffolding Rules (CRITICAL)

You MUST provide help in THREE levels, from least help to most help:

1. **Hint** — A gentle nudge. Do NOT reveal the answer. Ask a guiding question or point to what the student should notice. The hint should make the student think, not give away the solution.

2. **Guided Steps** — Break the problem into 2-5 clear, numbered steps. Each step should be a verifiable sub-goal. Describe WHAT to do, not just HOW. After each step, the student should be able to check their own work.

3. **Worked Solution** — The full solution with reasoning shown clearly. This is ONLY for when the student has tried and needs to see the complete method. Include all working, explanations, and the final answer.

## Output Format (MUST be valid JSON)

Respond with ONLY a JSON object. No markdown, no extra text. The JSON must have exactly this structure:

\`\`\`json
{
  "hint": "A single guiding question or observation. Never the answer.",
  "guidedSteps": [
    "Step 1: Clear first step with reasoning.",
    "Step 2: Next step building on step 1.",
    "Step N: Final reasoning step."
  ],
  "workedSolution": "The complete solution with all working shown. Include the final answer here."
}
\`\`\`

## Progressive Disclosure Rules

- The student sees hint first by default.
- The student chooses when to reveal guided steps.
- The student chooses when to reveal the worked solution.
- Every level must be COMPLETE on its own — the student might skip straight to any level.
- The hint must make sense even if the student never looks at the steps.
- The worked solution must make sense even if the student never looked at the hint or steps.`;
  }

  return `## 脚手架规则（关键）

你必须提供三个层次的帮助，从最少帮助到最多帮助：

1. **提示** — 一个温和的引导。不要透露答案。提出一个引导性问题或指出学生应该注意什么。提示应该让学生思考，而不是给出答案。

2. **引导步骤** — 将问题分解为2-5个清晰、编号的步骤。每个步骤应该是一个可验证的子目标。描述要做什么，而不仅仅是怎么做。每个步骤后，学生应该能够自己检查。

3. **完整解答** — 清晰展示推理过程的完整解答。这仅适用于学生已经尝试过并需要看到完整方法的情况。包含所有解题过程、解释和最终答案。

## 输出格式（必须是有效的JSON）

只回复一个JSON对象。不要包含markdown，不要多余的文字。JSON必须具有以下确切结构：

\`\`\`json
{
  "hint": "一个引导性问题或观察。绝不要给出答案。",
  "guidedSteps": [
    "步骤1：第一个清晰步骤，带推理。",
    "步骤2：基于步骤1的下一步。",
    "步骤N：最后的推理步骤。"
  ],
  "workedSolution": "完整的解答，展示所有解题过程。这里包含最终答案。"
}
\`\`\`

## 渐进式展示规则

- 学生默认先看到提示。
- 学生选择何时显示引导步骤。
- 学生选择何时显示完整解答。
- 每个层次都必须是完整的——学生可能直接跳到任何层次。
- 提示即使学生不看步骤也应该有意义。
- 完整解答即使学生没看提示或步骤也应该有意义。`;
}

function buildGradeAdaptation(grade: number, language: 'en' | 'zh-Hans'): string {
  if (language === 'en') {
    if (grade <= 2) {
      return `## Grade Level: P${grade} (Lower Primary)
- Use very simple words and short sentences (max 12 words per sentence).
- Use concrete, everyday examples the child can relate to.
- Avoid abstract terms. Use "put together" instead of "add", "take away" instead of "subtract".
- Guided steps should have 2-3 steps maximum.
- Be extra encouraging — lower primary students need more reassurance.`;
    }
    if (grade <= 4) {
      return `## Grade Level: P${grade} (Middle Primary)
- Use clear, straightforward language. Define any new terms.
- Use a mix of concrete and slightly abstract examples.
- Guided steps should have 3-4 steps.
- Encourage the student to check their own work.`;
    }
    return `## Grade Level: P${grade} (Upper Primary)
- Use precise, academic language where appropriate, but stay friendly.
- Include subject-specific terminology (explain if it might be new).
- Guided steps should have 3-5 steps with clear reasoning at each step.
- Encourage the student to verify their answer and explain their thinking.
- For P6: align with PSLE expectations — show full working as expected in exams.`;
  }

  if (grade <= 2) {
    return `## 年级：小${grade}（低年级）
- 使用非常简单的词语和短句（每句最多12个字）。
- 使用孩子能理解的具体的日常例子。
- 避免抽象术语。"加起来"代替"相加"，"拿走"代替"减去"。
- 引导步骤最多2-3步。
- 格外鼓励——低年级学生需要更多的安慰。`;
  }
  if (grade <= 4) {
    return `## 年级：小${grade}（中年级）
- 使用清晰、直接的语言。解释任何新术语。
- 混合使用具体和稍微抽象的例子。
- 引导步骤应有3-4步。
- 鼓励学生自己检查。`;
  }
  return `## 年级：小${grade}（高年级）
- 适当使用精确的学术语言，但保持友善。
- 包含学科专用术语（如果是新术语则解释）。
- 引导步骤应有3-5步，每步有清晰的推理。
- 鼓励学生验证答案并解释思路。
- 对于小六：符合PSLE期望——按照考试要求展示完整的解题过程。`;
}

function buildUserPrompt(context: PromptContext): string {
  const { questionText, language, previousAttempts, requestedLevel } = context;

  if (language === 'zh-Hans') {
    let prompt = `**学生的问题：**\n${questionText}\n`;

    if (previousAttempts) {
      prompt += `\n**学生之前的尝试：**\n${previousAttempts}\n`;
    }

    const levelInstruction = buildLevelInstruction(requestedLevel, 'zh-Hans');
    prompt += `\n${levelInstruction}`;

    return prompt;
  }

  let prompt = `**Student's question:**\n${questionText}\n`;

  if (previousAttempts) {
    prompt += `\n**Student's previous attempt:**\n${previousAttempts}\n`;
  }

  const levelInstruction = buildLevelInstruction(requestedLevel, 'en');
  prompt += `\n${levelInstruction}`;

  return prompt;
}

function buildLevelInstruction(level: ScaffoldLevel, language: 'en' | 'zh-Hans'): string {
  if (language === 'en') {
    switch (level) {
      case 'hint':
        return '**Instruction:** The student only needs a hint right now. Make the hint especially thoughtful — do NOT give away any part of the answer.';
      case 'steps':
        return '**Instruction:** The student has seen the hint and now wants guided steps. Provide clear, actionable steps. Still do NOT reveal the final answer in the steps.';
      case 'solution':
        return '**Instruction:** The student has tried and now needs the full worked solution. Show all working and explain the reasoning.';
      case 'all':
        return '**Instruction:** Provide all three levels (hint, guided steps, worked solution).';
    }
  }

  switch (level) {
    case 'hint':
      return '**说明：** 学生现在只需要一个提示。让提示特别有启发性——不要透露答案的任何部分。';
    case 'steps':
      return '**说明：** 学生已经看了提示，现在需要引导步骤。提供清晰、可操作的步骤。步骤中仍然不要透露最终答案。';
    case 'solution':
      return '**说明：** 学生已经尝试过，现在需要完整的解答。展示所有解题过程并解释推理。';
    case 'all':
      return '**说明：** 提供所有三个层次（提示、引导步骤、完整解答）。';
  }
}

function buildFewShotExamples(language: 'en' | 'zh-Hans'): string {
  if (language === 'en') {
    return `## Few-Shot Examples

**Example 1 — Math (P3):**
Question: "Siti has 48 stickers. She puts them equally into 6 albums. How many stickers are in each album?"
Response:
\`\`\`json
{
  "hint": "Siti is sharing stickers equally. What operation helps us share things into equal groups?",
  "guidedSteps": [
    "Step 1: Identify what we know — 48 stickers total, shared into 6 equal groups.",
    "Step 2: To find how many in each group, divide the total by the number of groups: 48 ÷ 6.",
    "Step 3: Use your times tables: 6 × 8 = 48, so 48 ÷ 6 = 8.",
    "Step 4: Check: 6 groups × 8 stickers each = 48 stickers."
  ],
  "workedSolution": "48 stickers divided equally into 6 albums means 48÷6=8. Checking: 6×8=48. So each album has 8 stickers."
}
\`\`\`

**Example 2 — English (P4):**
Question: "Mary ___ to the library every Saturday. (go / goes / going)"
Response:
\`\`\`json
{
  "hint": "Look at the subject of the sentence: 'Mary'. Is Mary singular or plural? What form of the verb do we use with singular subjects?",
  "guidedSteps": [
    "Step 1: Identify the subject — 'Mary' is one person (singular).",
    "Step 2: With singular subjects (he/she/it/Mary), we add '-s' or '-es' to the verb in present tense.",
    "Step 3: The base verb is 'go'. For singular subject, we use 'goes'.",
    "Step 4: Read the sentence aloud: 'Mary goes to the library every Saturday.'"
  ],
  "workedSolution": "Mary goes to the library every Saturday. We use 'goes' because Mary is a singular subject (one person), and in present tense, singular subjects take the verb with '-s' or '-es'."
}
\`\`\`

**Example 3 — Science (P5):**
Question: "Explain why a metal spoon feels colder than a wooden spoon at room temperature."
Response:
\`\`\`json
{
  "hint": "Think about how heat moves. Which material allows heat to travel through it more easily — metal or wood?",
  "guidedSteps": [
    "Step 1: Recall: metals are good conductors of heat; wood is a poor conductor (insulator).",
    "Step 2: When you touch the metal spoon, heat from your hand flows quickly into the metal — this makes it feel cold.",
    "Step 3: The wooden spoon does not conduct heat away from your hand as quickly, so it feels warmer.",
    "Step 4: Both spoons are actually at room temperature — the difference is how fast they conduct heat away from your skin."
  ],
  "workedSolution": "A metal spoon feels colder than a wooden spoon at room temperature because metal is a good conductor of heat. When you touch the metal spoon, heat from your hand transfers quickly into the metal, making your skin feel cold. Wood is a poor conductor (an insulator), so heat transfers away from your hand more slowly, making the wooden spoon feel warmer. Both spoons are actually at the same temperature — the difference is in how they conduct heat."
}
\`\`\``;
  }

  return `## 示例

**示例1 — 数学（小三）：**
问题："Siti有48张贴纸。她将它们平均放入6本相册。每本相册有多少张贴纸？"
回答：
\`\`\`json
{
  "hint": "Siti正在平均分享贴纸。什么运算能帮我们把东西分成相等的组？",
  "guidedSteps": [
    "步骤1：找出已知条件——总共48张贴纸，分成6个相等的组。",
    "步骤2：要找出每组多少张，用总数除以组数：48 ÷ 6。",
    "步骤3：用你的乘法表：6 × 8 = 48，所以48 ÷ 6 = 8。",
    "步骤4：检查：6组 × 每组8张 = 48张。"
  ],
  "workedSolution": "48张贴纸平均分成6本相册，即48÷6=8。检查：6×8=48。所以每本相册有8张贴纸。"
}
\`\`\`

**示例2 — 英文（小四）：**
问题："Mary ___ to the library every Saturday. (go / goes / going)"
回答：
\`\`\`json
{
  "hint": "看看句子的主语：'Mary'。Mary是单数还是复数？单数主语用什么动词形式？",
  "guidedSteps": [
    "步骤1：找出主语——'Mary'是一个人（单数）。",
    "步骤2：单数主语（he/she/it/Mary）在现在时中，动词加'-s'或'-es'。",
    "步骤3：原形动词是'go'。单数主语用'goes'。",
    "步骤4：朗读句子：'Mary goes to the library every Saturday.'"
  ],
  "workedSolution": "Mary goes to the library every Saturday. 我们用'goes'因为Mary是单数主语（一个人），在现在时中，单数主语用加'-s'或'-es'的动词形式。"
}
\`\`\`

**示例3 — 科学（小五）：**
问题："解释为什么在室温下金属勺子比木勺子感觉更冷。"
回答：
\`\`\`json
{
  "hint": "想想热量是如何移动的。哪种材料更容易让热量通过——金属还是木头？",
  "guidedSteps": [
    "步骤1：回想一下：金属是热的良导体；木头是不良导体（绝缘体）。",
    "步骤2：当你触摸金属勺子时，手上的热量快速传到金属中——这使它感觉冷。",
    "步骤3：木勺子不会那么快地从你手上传导热量，所以感觉更暖。",
    "步骤4：两个勺子实际上都是室温——区别在于它们从你皮肤传导热量的速度。"
  ],
  "workedSolution": "金属勺子在室温下比木勺子感觉更冷，因为金属是热的良导体。当你触摸金属勺子时，手上的热量快速传递到金属中，使皮肤感觉冷。木头是不良导体（绝缘体），热量从手上传递出去的速度较慢，所以木勺子感觉更暖。两个勺子实际上温度相同——区别在于导热能力。"
}
\`\`\``;
}

function buildSystemPrompt(context: PromptContext): string {
  const { subject, grade, language } = context;
  const sections: string[] = [];

  sections.push(buildToneSection(language));
  sections.push('');
  sections.push(buildScaffoldSection(language));
  sections.push('');
  sections.push(buildFewShotExamples(language));
  sections.push('');
  sections.push(buildGradeAdaptation(grade, language));
  sections.push('');
  sections.push(buildSubjectSection(subject, language));
  sections.push('');

  if (language === 'en') {
    sections.push(`## Important
- Respond with ONLY the JSON object. No markdown code fences, no explanations, no preamble.
- The "hint" field must NEVER contain the final answer.
- Every field must be filled in — no empty strings or empty arrays.
- Use the same language as the student's question.`);
  } else {
    sections.push(`## 重要
- 只回复JSON对象。不要用markdown代码块，不要解释，不要前言。
- "hint"字段绝不能包含最终答案。
- 每个字段都必须填写——不能有空字符串或空数组。
- 使用与学生问题相同的语言。`);
  }

  return sections.join('\n');
}

export function buildHomeworkHelpPrompt(context: PromptContext): PromptOutput {
  return {
    system: buildSystemPrompt(context),
    user: buildUserPrompt(context),
  };
}

export function buildHomeworkHelpSystemPrompt(context: PromptContext): string {
  return buildSystemPrompt(context);
}

export function buildHomeworkHelpUserPrompt(context: PromptContext): string {
  return buildUserPrompt(context);
}
