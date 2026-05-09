import type { SubjectAdapter, Subject, Language } from '../types';

const ADAPTERS: Record<Subject, Record<Language, SubjectAdapter>> = {
  math: {
    en: {
      subject: 'math',
      language: 'en',
      instruction: `For MATH questions:
- Always show step-by-step working. Number each step clearly.
- Include the mathematical operation used (e.g. addition, multiplication).
- For word problems: help the student identify what is given and what is asked.
- Use model drawing (bar models) for P1-P4 word problems where helpful.
- For P5-P6: include unit conversions and check reasonableness of answers.
- Never just give the numerical answer — explain the reasoning.`,
      exampleHints: [
        "Look at the numbers. What operation do you think we need?",
        "Draw a bar model to see what's given and what's missing.",
        "What do we know? What are we trying to find?",
        "Try breaking this into smaller steps.",
      ],
      forbiddenPatterns: [
        "Giving the final numerical answer in the hint section.",
        "Saying 'the answer is X' without showing working.",
        "Using algebra before P5 (use model drawing instead).",
      ],
    },
    'zh-Hans': {
      subject: 'math',
      language: 'zh-Hans',
      instruction: `对于数学题：
- 始终展示逐步解题过程。每一步都要清楚编号。
- 包含所用的数学运算（如加法、乘法）。
- 对于应用题：帮助学生找出已知条件和所求内容。
- 对于小一至小四的应用题，在合适时使用模型图（条形图）。
- 对于小五小六：包含单位换算并检查答案的合理性。
- 绝不要只给出数字答案——要解释推理过程。`,
      exampleHints: [
        "看看这些数字。你觉得我们需要用什么运算？",
        "画一个条形图，看看已知什么、缺少什么。",
        "我们已知什么？我们要找什么？",
        "试着把这个分成更小的步骤。",
      ],
      forbiddenPatterns: [
        "在提示部分给出最终的数字答案。",
        "说'答案是X'而不展示解题过程。",
        "在小五之前使用代数（应使用模型图）。",
      ],
    },
  },
  english: {
    en: {
      subject: 'english',
      language: 'en',
      instruction: `For ENGLISH questions:
- For comprehension: help the student find clues in the passage first.
- For grammar: guide the student to identify the grammar rule, don't just give the answer.
- For vocabulary: explain word meanings with examples, then ask the student to try.
- For synthesis/transformation: show how two sentences relate before combining.
- For composition: give structure tips (beginning, middle, end), not full paragraphs.
- Always quote the relevant part of the passage if one is provided.`,
      exampleHints: [
        "Read the passage again. Which paragraph talks about this?",
        "What tense is the sentence in? That gives us a clue.",
        "Think about what this word means. What similar words do you know?",
        "How do these two ideas connect?",
      ],
      forbiddenPatterns: [
        "Writing complete composition paragraphs for the student.",
        "Giving the grammar answer without explaining the rule.",
        "Providing the exact comprehension answer without guiding the student to find it.",
      ],
    },
    'zh-Hans': {
      subject: 'english',
      language: 'zh-Hans',
      instruction: `对于英文题：
- 阅读理解：先帮助学生找到文章中的线索。
- 语法：引导学生找出语法规则，不要直接给答案。
- 词汇：用例子解释词义，然后让学生尝试。
- 句子改写/合并：先展示两个句子之间的关系，再合并。
- 作文：给出结构技巧（开头、中间、结尾），而不是完整的段落。
- 如果提供了文章，始终引用相关部分。`,
      exampleHints: [
        "再读一遍文章。哪一段讲到了这个？",
        "这个句子是什么时态？这给我们一个线索。",
        "想想这个词的意思。你知道哪些相似的词？",
        "这两个想法怎么联系起来？",
      ],
      forbiddenPatterns: [
        "为学生写完整的作文段落。",
        "不解释语法规则就直接给答案。",
        "不引导学生自己找到答案就给出准确的理解题答案。",
      ],
    },
  },
  science: {
    en: {
      subject: 'science',
      language: 'en',
      instruction: `For SCIENCE questions:
- Use the CER framework: Claim, Evidence, Reasoning.
- Help the student recall the relevant science concept first.
- Ask guiding questions about what they observe or know.
- For experiment questions: identify variables (changed, measured, kept the same).
- Use everyday Singapore examples (e.g. condensation on a cold drink, shadow at the playground).
- For P3-P4: focus on observation and classification.
- For P5-P6: include systems, cycles, and interactions.`,
      exampleHints: [
        "What do you observe? What do you already know about this?",
        "Which variable is being changed in this experiment?",
        "Think about the science concept we learned. Which one applies here?",
        "What is your claim? What evidence supports it?",
      ],
      forbiddenPatterns: [
        "Using the exact answer wording from MOE syllabus answer keys.",
        "Skipping the evidence step when giving explanations.",
        "Using terms beyond the primary school syllabus.",
      ],
    },
    'zh-Hans': {
      subject: 'science',
      language: 'zh-Hans',
      instruction: `对于科学题：
- 使用CER框架：论点、证据、推理。
- 先帮助学生回忆相关的科学概念。
- 提出引导性问题，让学生思考他们观察到或已知的内容。
- 对于实验题：找出变量（改变的、测量的、保持不变的）。
- 使用新加坡的日常例子（如冷饮上的凝结、游乐场的影子）。
- 对于小三小四：关注观察和分类。
- 对于小五小六：包含系统、循环和相互作用。`,
      exampleHints: [
        "你观察到什么？关于这个你已经知道了什么？",
        "这个实验中哪个变量在被改变？",
        "想想我们学过的科学概念。哪个适用于这里？",
        "你的论点是什么？有什么证据支持它？",
      ],
      forbiddenPatterns: [
        "使用教育部大纲答案中的原话。",
        "在给解释时跳过证据步骤。",
        "使用超出小学大纲范围的术语。",
      ],
    },
  },
  chinese_mt: {
    en: {
      subject: 'chinese_mt',
      language: 'en',
      instruction: `For CHINESE MOTHER TONGUE questions:
- Always respond in Chinese (Simplified) for Chinese MT questions.
- For 阅读理解 (comprehension): guide the student to find keywords in the passage.
- For 造句 (sentence making): help with word usage and context, not full sentences.
- For 作文 (composition): give structure and vocabulary suggestions, not full compositions.
- For 拼音 (hanyu pinyin): help with tone marks and pronunciation hints.
- Be extra patient — Chinese MT can be challenging for Singapore students.`,
      exampleHints: [
        "关键词是什么？在文章中找一找。",
        "这个字是什么意思？看看它的部首。",
        "你能用这个词造一个简单的句子吗？",
        "注意声调——这个字是第几声？",
      ],
      forbiddenPatterns: [
        "Writing complete compositions for the student.",
        "Using Traditional Chinese characters.",
        "Giving answers without explaining the language rule.",
      ],
    },
    'zh-Hans': {
      subject: 'chinese_mt',
      language: 'zh-Hans',
      instruction: `对于华文题：
- 华文题始终用简体中文回答。
- 阅读理解：引导学生找出文章中的关键词。
- 造句：帮助理解词语用法和语境，而不是给出完整句子。
- 作文：给出结构和词汇建议，而不是完整作文。
- 拼音：帮助声调标注和发音提示。
- 请格外耐心——华文对新加坡学生来说可能有挑战。`,
      exampleHints: [
        "关键词是什么？在文章中找一找。",
        "这个字是什么意思？看看它的部首。",
        "你能用这个词造一个简单的句子吗？",
        "注意声调——这个字是第几声？",
      ],
      forbiddenPatterns: [
        "为学生写完整的作文。",
        "使用繁体字。",
        "不解释语言规则就给出答案。",
      ],
    },
  },
};

export function getSubjectAdapter(subject: Subject, language: Language): SubjectAdapter {
  return ADAPTERS[subject][language];
}

export function buildSubjectSection(subject: Subject, language: Language): string {
  const adapter = getSubjectAdapter(subject, language);
  const parts: string[] = [];

  parts.push(`## Subject-Specific Instructions`);
  parts.push(adapter.instruction);
  parts.push('');

  parts.push(`### Example Hints (for your reference)`);
  adapter.exampleHints.forEach((hint) => {
    parts.push(`- "${hint}"`);
  });
  parts.push('');

  parts.push(`### DO NOT DO`);
  adapter.forbiddenPatterns.forEach((pattern, i) => {
    parts.push(`${i + 1}. ${pattern}`);
  });

  return parts.join('\n');
}
