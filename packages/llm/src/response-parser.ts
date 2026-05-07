/**
 * Response Parser — validates and parses the structured JSON output from the LLM.
 *
 * The LLM outputs a JSON blob (single-pass structured output). This module
 * validates it against the expected schema, extracts questions, and handles
 * edge cases like malformed JSON or missing fields.
 *
 * @see types.ts — InferenceResponse, QuestionResponse, SolutionStep
 */

import type { InferenceResponse, QuestionResponse, SolutionStep } from './types';

// ── Raw LLM output shape (before validation) ──────────────────────

interface RawQuestionResponse {
  questionIndex?: number;
  questionText?: string;
  detectedSubject?: string;
  detectedTopic?: string;
  hint?: string;
  steps?: Array<{
    step?: number;
    description?: string;
    working?: string;
  }>;
  fullSolution?: string;
  suggestedFollowUp?: string;
}

interface RawInferenceResponse {
  questions?: RawQuestionResponse[];
  subject?: string;
  confidence?: number;
}

// ── Valid subject IDs ──────────────────────────────────────────────

const VALID_SUBJECTS = new Set(['math', 'english', 'science', 'chinese_mt']);

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSubject(raw: string | undefined): 'math' | 'english' | 'science' | 'chinese_mt' {
  if (!raw) return 'math';
  const lower = raw.toLowerCase().trim();
  if (lower === 'chinese_mt' || lower === 'chinese' || lower === 'chinese mt') return 'chinese_mt';
  if (VALID_SUBJECTS.has(lower)) return lower as 'math' | 'english' | 'science' | 'chinese_mt';
  return 'math';
}

// ── Parser ─────────────────────────────────────────────────────────

/**
 * Attempt to extract a JSON object from the LLM's raw text output.
 * Handles common issues: markdown code fences, leading/trailing text, BOM.
 */
function extractJson(raw: string): unknown {
  // Remove markdown code fences
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1]!.trim();
  }

  // Try to find the first '{' and last '}'
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No valid JSON object found in LLM output');
  }

  cleaned = cleaned.slice(start, end + 1);

  return JSON.parse(cleaned);
}

/**
 * Parse and validate the LLM's raw output into an InferenceResponse.
 *
 * @param rawOutput — raw text output from the LLM
 * @param questionCount — expected number of questions (for validation)
 * @returns parsed InferenceResponse
 * @throws if output cannot be parsed
 */
export function parseInferenceResponse(
  rawOutput: string,
  questionCount: number,
): InferenceResponse {
  const parsed = extractJson(rawOutput) as RawInferenceResponse;

  const asRawQuestion = parsed as unknown as RawQuestionResponse;

  if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    // Fallback: try to parse as a single question object (flat response)
    if (asRawQuestion.hint || asRawQuestion.steps) {
      parsed.questions = [asRawQuestion];
    } else {
      return {
        sessionId: generateId(),
        createdAt: new Date().toISOString(),
        questions: [],
        subject: 'math',
        confidence: 0,
        error: {
          code: 'no_questions_detected',
          message: 'No questions could be detected from the homework photo. Please try again with a clearer image, or type your question manually.',
          messageZh: '无法从作业照片中识别出题目。请尝试拍摄更清晰的照片，或手动输入题目。',
        },
      };
    }
  }

  const questions: QuestionResponse[] = parsed.questions.map((q, i) => {
    const steps: SolutionStep[] = (q.steps ?? []).map((s, j) => ({
      step: s.step ?? j + 1,
      description: s.description ?? '',
      working: s.working,
    }));

    return {
      questionIndex: q.questionIndex ?? i + 1,
      questionText: q.questionText ?? '',
      detectedSubject: q.detectedSubject,
      detectedTopic: q.detectedTopic,
      hint: q.hint ?? 'Try reading the question carefully. What information do you already know?',
      steps,
      fullSolution: q.fullSolution ?? steps.map(s => s.description).join('\n'),
      suggestedFollowUp: q.suggestedFollowUp,
    };
  });

  return {
    sessionId: generateId(),
    createdAt: new Date().toISOString(),
    questions,
    subject: normalizeSubject(parsed.subject),
    confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
  };
}
