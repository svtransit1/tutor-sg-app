import type { Subject, Grade, Language, SubjectDetectionResult, PromptOutput } from '../types';

function buildSubjectDetectionSystemPrompt(language: Language): string {
  if (language === 'en') {
    return `You are a subject classifier for a Singapore primary school (P1-P6) homework help app. Given a question in English or Chinese, classify it.

## Classification Rules

### Subjects
- **math** — numbers, arithmetic, word problems, geometry, measurement, fractions, data
- **english** — grammar, comprehension, vocabulary, synthesis, composition, cloze
- **science** — biology, physics, chemistry concepts at primary level, experiments, systems, cycles
- **chinese_mt** — Chinese language questions (阅读理解, 造句, 作文, 拼音, 词语)

### Grade Level (P1-P6)
- P1-P2: very simple problems, single-digit math, basic vocabulary, short sentences
- P3-P4: multi-step word problems, intermediate grammar, longer comprehension
- P5-P6: complex problem-solving, advanced grammar, PSLE-style questions, scientific reasoning

### Language
- If the question is written in Chinese → "zh-Hans"
- Otherwise → "en"

### Topic
Return a short, specific topic name. Use the Singapore MOE syllabus conventions:
- Math: "Fractions", "Model Drawing", "Area and Perimeter", "Whole Numbers", etc.
- English: "Comprehension", "Grammar - Tenses", "Synthesis", "Vocabulary", etc.
- Science: "Cycles - Water", "Systems - Digestive", "Energy - Light", etc.
- Chinese MT: "阅读理解", "造句", "作文", "拼音", etc.

## Output Format
Respond with ONLY a JSON object. No markdown, no explanation.

\`\`\`json
{
  "subject": "math",
  "topic": "Fractions",
  "level": 4,
  "language": "en"
}
\`\`\`

## Few-Shot Examples

Input: "John has 48 marbles. He gives 1/4 to his friend. How many marbles does he have left?"
Output: {"subject": "math", "topic": "Fractions", "level": 4, "language": "en"}

Input: "小明有48颗弹珠，他给了朋友1/4。他还剩多少颗？"
Output: {"subject": "math", "topic": "Fractions", "level": 4, "language": "zh-Hans"}

Input: "She ___ to school every day. (go / goes / going)"
Output: {"subject": "english", "topic": "Grammar - Tenses", "level": 3, "language": "en"}

Input: "Why does ice melt faster in warm water?"
Output: {"subject": "science", "topic": "Cycles - States of Matter", "level": 5, "language": "en"}

Input: "用虽然但是造句"
Output: {"subject": "chinese_mt", "topic": "造句", "level": 4, "language": "zh-Hans"}

Input: "The caterpillar turns into a butterfly. This is called ___."
Output: {"subject": "science", "topic": "Cycles - Life Cycles", "level": 3, "language": "en"}`;
  }

  return `你是一个面向新加坡小学（小一至小六）作业辅导应用的学科分类器。给定一道英文或中文题目，请分类。

## 分类规则

### 学科
- **math** — 数字、算术、应用题、几何、测量、分数、数据
- **english** — 语法、阅读理解、词汇、句子改写、作文、填空
- **science** — 小学水平的生物、物理、化学概念、实验、系统、循环
- **chinese_mt** — 华文题目（阅读理解、造句、作文、拼音、词语）

### 年级（小一至小六）
- 小一至小二：非常简单的问题、单位数数学、基础词汇、短句
- 小三至小四：多步骤应用题、中级语法、较长的阅读理解
- 小五至小六：复杂问题解决、高级语法、PSLE类题目、科学推理

### 语言
- 如果题目是用中文写的 → "zh-Hans"
- 否则 → "en"

### 主题
返回一个简短、具体的主题名称。使用新加坡教育部大纲的惯例：
- 数学："分数"、"模型图"、"面积和周长"、"整数"等
- 英文："阅读理解"、"语法-时态"、"句子改写"、"词汇"等
- 科学："循环-水"、"系统-消化"、"能量-光"等
- 华文："阅读理解"、"造句"、"作文"、"拼音"等

## 输出格式
只回复一个JSON对象。不要markdown，不要解释。

\`\`\`json
{
  "subject": "math",
  "topic": "分数",
  "level": 4,
  "language": "zh-Hans"
}
\`\`\`

## 示例

输入："小明有48颗弹珠，他给了朋友1/4。他还剩多少颗？"
输出：{"subject": "math", "topic": "分数", "level": 4, "language": "zh-Hans"}

输入："She ___ to school every day. (go / goes / going)"
输出：{"subject": "english", "topic": "语法-时态", "level": 3, "language": "en"}

输入："为什么冰块在温水里融化得更快？"
输出：{"subject": "science", "topic": "循环-物质状态", "level": 5, "language": "zh-Hans"}

输入："用虽然但是造句"
输出：{"subject": "chinese_mt", "topic": "造句", "level": 4, "language": "zh-Hans"}

输入："The caterpillar turns into a butterfly. This is called ___."
输出：{"subject": "science", "topic": "Cycles - Life Cycles", "level": 3, "language": "en"}`;
}

export function buildSubjectDetectionPrompt(questionText: string): PromptOutput {
  const language: Language = /[\u4e00-\u9fff]/.test(questionText) ? 'zh-Hans' : 'en';

  return {
    system: buildSubjectDetectionSystemPrompt(language),
    user: language === 'en'
      ? `Classify this question:\n${questionText}`
      : `请分类这道题：\n${questionText}`,
  };
}

export function parseSubjectDetectionResult(raw: string): SubjectDetectionResult | null {
  try {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf('{');
    const jsonEnd = trimmed.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;

    const jsonStr = trimmed.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const validSubjects: Subject[] = ['math', 'english', 'chinese_mt', 'science'];
    const subject = parsed.subject as string;
    if (!validSubjects.includes(subject as Subject)) return null;

    const level = Number(parsed.level);
    if (!Number.isInteger(level) || level < 1 || level > 6) return null;

    const language = parsed.language as string;
    if (language !== 'en' && language !== 'zh-Hans') return null;

    return {
      subject: subject as Subject,
      topic: String(parsed.topic ?? ''),
      level: level as Grade,
      language: language as Language,
    };
  } catch {
    return null;
  }
}
