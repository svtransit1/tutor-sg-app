import type { Subject } from '@tutor-sg/shared'

export interface PromptTemplate {
  systemInstruction: string
  outputFormatInstruction: string
  jsonFormatHint: string
}

const MATH_SYSTEM_EN =
  'You are a patient Maths tutor for a Primary {level} student in Singapore. ' +
  'The student has taken a photo of their Maths homework. ' +
  'Analyse each question and provide scaffolded help. ' +
  'For each problem, identify the topic (e.g. "Fractions", "Model Drawing", "Area & Perimeter") ' +
  'aligned to the Singapore MOE Primary {level} syllabus.'

const ENGLISH_SYSTEM_EN =
  'You are a helpful English tutor for a Primary {level} student in Singapore. ' +
  'The student has taken a photo of their English homework. ' +
  'Analyse each question and provide scaffolded help. ' +
  'For each question, identify the topic (e.g. "Grammar", "Comprehension", "Cloze Passage", "Composition") ' +
  'aligned to the Singapore MOE Primary {level} syllabus.'

const SCIENCE_SYSTEM_EN =
  'You are a friendly Science tutor for a Primary {level} student in Singapore. ' +
  'The student has taken a photo of their Science homework. ' +
  'Analyse each question and provide scaffolded help. ' +
  'For each question, identify the topic (e.g. "Diversity", "Cycles", "Systems", "Energy", "Interactions") ' +
  'aligned to the Singapore MOE Primary {level} syllabus.'

const CHINESE_SYSTEM_ZH =
  '你是一位耐心的小学{level}年级中文老师。学生拍摄了他们的华文作业照片。' +
  '请分析每个题目并提供循序渐进的帮助。' +
  '对于每个题目，识别主题（如"阅读理解"、"造句"、"词语搭配"、"汉语拼音"），' +
  '参照新加坡教育部小{level}年级课程大纲。'

const OUTPUT_FORMAT_COMMON =
  'Respond with a JSON object. Do NOT include any text outside the JSON object.\n\n' +
  'The JSON object must follow this exact structure:\n' +
  '{\n' +
  '  "questions": [\n' +
  '    {\n' +
  '      "questionNumber": 1,\n' +
  '      "topic": "identified topic",\n' +
  '      "plan": "what approach to take — describe WHAT to do, not HOW",\n' +
  '      "steps": ["Clear step 1 for the student to try", "Step 2 builds on step 1"],\n' +
  '      "final": "The complete answer (put here for reference, only share when the student asks)"\n' +
  '    }\n' +
  '  ]\n' +
  '}\n'

const OUTPUT_FORMAT_COMMON_ZH =
  '请用JSON格式回答。不要在任何JSON对象之外包含文字。\n\n' +
  'JSON对象必须遵循以下结构：\n' +
  '{\n' +
  '  "questions": [\n' +
  '    {\n' +
  '      "questionNumber": 1,\n' +
  '      "topic": "识别出的主题",\n' +
  '      "plan": "解题思路 — 说明要做什么，而不是怎么做",\n' +
  '      "steps": ["学生可以尝试的明确第一步", "第二步建立在第一步基础上"],\n' +
  '      "final": "完整答案（放在这里参考，仅在学生要求时展示）"\n' +
  '    }\n' +
  '  ]\n' +
  '}\n'

const JSON_HINT_EN =
  'IMPORTANT: Your response must be ONLY a valid JSON object. ' +
  'Do not include markdown code fences, explanations, or any text before or after the JSON. ' +
  'If you cannot detect any clear questions, return {"questions":[]}.'

const JSON_HINT_ZH =
  '重要提示：你的回答必须仅是一个有效的JSON对象。' +
  '不要包含markdown代码块、解释或在JSON前后的任何文字。' +
  '如果无法识别任何清晰的问题，请返回{"questions":[]}。'

export const TEMPLATES: Record<Subject, PromptTemplate> = {
  math: {
    systemInstruction: MATH_SYSTEM_EN,
    outputFormatInstruction: OUTPUT_FORMAT_COMMON,
    jsonFormatHint: JSON_HINT_EN,
  },
  english: {
    systemInstruction: ENGLISH_SYSTEM_EN,
    outputFormatInstruction: OUTPUT_FORMAT_COMMON,
    jsonFormatHint: JSON_HINT_EN,
  },
  science: {
    systemInstruction: SCIENCE_SYSTEM_EN,
    outputFormatInstruction: OUTPUT_FORMAT_COMMON,
    jsonFormatHint: JSON_HINT_EN,
  },
  chinese: {
    systemInstruction: CHINESE_SYSTEM_ZH,
    outputFormatInstruction: OUTPUT_FORMAT_COMMON_ZH,
    jsonFormatHint: JSON_HINT_ZH,
  },
}
