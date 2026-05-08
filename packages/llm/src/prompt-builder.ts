/**
 * Prompt Builder — constructs structured prompts for on-device LLM inference.
 *
 * Builds the system prompt + user message from OCR output, subject, and grade.
 * The prompt is designed for single-pass structured JSON output from Gemma E4B.
 *
 * Prompt design principles (from DeepTutor architecture lift):
 * - Each step must be a verifiable sub-goal — describe WHAT, not HOW
 * - Never show the full answer unless the kid explicitly asks
 * - Default behavior: hint first
 *
 * @see types.ts — InferenceRequest, OcrResult
 * @see ADD §4.1 — Camera homework check
 */

import type { InferenceRequest } from './types';

// ── Prompt Templates ────────────────────────────────────────────────

const SYSTEM_PROMPT_EN = `You are a patient, encouraging primary-school tutor for Singapore students (P1–P6). You help kids understand their homework by providing scaffolded guidance.

RULES:
1. Read the homework text from OCR output. Identify each question.
2. For each question, provide:
   - A short, kid-friendly HINT that guides thinking without giving the answer
   - STEP-BY-STEP guidance (2–5 steps) walking through the solution
   - A FULL SOLUTION that the kid can request
3. Detect the subject (math/english/science/chinese_mt) and specific topic.
4. Use Singapore MOE syllabus terminology.
5. Keep language simple, encouraging, and age-appropriate for the specified grade.
6. If the OCR text is unreadable or not homework, say so clearly.

RESPONSE FORMAT — output valid JSON only:
{
  "questions": [
    {
      "questionIndex": 1,
      "questionText": "The detected question text",
      "detectedSubject": "math|english|science|chinese_mt",
      "detectedTopic": "specific topic name",
      "hint": "A short hint that guides thinking",
      "steps": [
        { "step": 1, "description": "Step description", "working": "optional working" }
      ],
      "fullSolution": "Complete solution",
      "suggestedFollowUp": "Optional follow-up question"
    }
  ],
  "subject": "math|english|science|chinese_mt",
  "confidence": 0.95
}`;

const SYSTEM_PROMPT_ZH = `你是一位耐心、鼓励人的新加坡小学生（小一到小六）家庭教师。你帮助孩子们理解功课，提供循序渐进的指导。

规则：
1. 阅读 OCR 识别的功课内容，识别每道题目。
2. 对每道题提供：
   - 简短、友善的提示，引导思考但不给答案
   - 分步指导（2–5 步），讲解解题过程
   - 完整的解答（孩子要求时才显示）
3. 识别科目（数学/英语/科学/华文）和具体主题。
4. 使用新加坡教育部教学大纲术语。
5. 语言简单、鼓励性，适合对应年级。
6. 如果 OCR 文本无法识别或不是功课，请明确说明。

输出格式 — 仅输出有效 JSON：
{
  "questions": [
    {
      "questionIndex": 1,
      "questionText": "识别出的题目文本",
      "detectedSubject": "math|english|science|chinese_mt",
      "detectedTopic": "具体主题名称",
      "hint": "引导思考的简短提示",
      "steps": [
        { "step": 1, "description": "步骤说明", "working": "可选的计算过程" }
      ],
      "fullSolution": "完整解答",
      "suggestedFollowUp": "可选的追问"
    }
  ],
  "subject": "math|english|science|chinese_mt",
  "confidence": 0.95
}`;

// ── Builder ─────────────────────────────────────────────────────────

export interface BuiltPrompt {
  system: string;
  user: string;
}

/**
 * Build a structured prompt from an inference request.
 */
export function buildPrompt(request: InferenceRequest): BuiltPrompt {
  const system = request.language === 'zh-Hans' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

  const userParts: string[] = [];

  // Header with context
  userParts.push(`[CONTEXT]`);
  userParts.push(`Grade: ${request.grade}`);
  userParts.push(`Subject: ${request.subject}`);
  userParts.push(`Language: ${request.language}`);
  userParts.push('');

  // OCR text
  userParts.push(`[HOMEWORK TEXT FROM OCR]`);
  userParts.push(request.ocr.fullText);

  if (request.ocr.lowConfidenceBlocks > 0) {
    userParts.push('');
    userParts.push(`[NOTE] ${request.ocr.lowConfidenceBlocks} part(s) of the text were unclear. Please focus on what is clear and mention the unclear parts in your response.`);
  }

  // Pre-segmented questions (if available)
  if (request.questions && request.questions.length > 0) {
    userParts.push('');
    userParts.push(`[DETECTED QUESTIONS]`);
    request.questions.forEach((q, _i) => {
      const source = q.manuallyEntered ? '(manually entered)' : '';
      userParts.push(`Q${q.index}: ${q.text} ${source}`);
    });
  }

  userParts.push('');
  userParts.push(`Please provide scaffolded help for each question. Use ${request.language === 'zh-Hans' ? 'Simplified Chinese' : 'English'}.`);

  return {
    system,
    user: userParts.join('\n'),
  };
}

/**
 * Build a follow-up prompt for further discussion on a question.
 */
export function buildFollowUpPrompt(
  originalQuestion: string,
  responseSoFar: string,
  followUp: string,
  language: 'en' | 'zh-Hans',
): BuiltPrompt {
  const system = language === 'zh-Hans' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

  const userParts: string[] = [
    `[ORIGINAL QUESTION]`,
    originalQuestion,
    '',
    `[MY PREVIOUS RESPONSE]`,
    responseSoFar,
    '',
    `[STUDENT FOLLOW-UP]`,
    followUp,
    '',
    `The student is asking a follow-up. Respond helpfully. Keep it simple and encouraging.`,
  ];

  return {
    system,
    user: userParts.join('\n'),
  };
}
