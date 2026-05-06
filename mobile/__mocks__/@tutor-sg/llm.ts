/**
 * Mock for @tutor-sg/llm package used in mobile tests.
 */

// ── Types ──

export type SubjectId = 'math' | 'english' | 'science' | 'chinese_mt';
export type GradeLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
export type ModelTier = 'E2B' | 'E4B';

export interface OcrTextBlock {
  text: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
  manuallyEntered?: boolean;
}

export interface OcrPageResult {
  pageIndex: number;
  blocks: OcrTextBlock[];
  overallConfidence: number;
  hasManualInput: boolean;
}

export interface OcrResult {
  pages: OcrPageResult[];
  fullText: string;
  lowConfidenceBlocks: number;
  needsManualInput: boolean;
}

export interface DetectedQuestion {
  index: number;
  text: string;
  confidence: number;
  manuallyEntered?: boolean;
}

export interface SolutionStep {
  step: number;
  description: string;
  working?: string;
}

export interface QuestionResponse {
  questionIndex: number;
  questionText: string;
  detectedSubject?: string;
  detectedTopic?: string;
  hint: string;
  steps: SolutionStep[];
  fullSolution: string;
  suggestedFollowUp?: string;
}

export interface InferenceResponse {
  sessionId: string;
  createdAt: string;
  questions: QuestionResponse[];
  subject: SubjectId;
  confidence: number;
  error?: {
    code: string;
    message: string;
    messageZh: string;
  };
}

export interface InferenceRequest {
  ocr: OcrResult;
  questions?: DetectedQuestion[];
  subject: SubjectId | 'auto';
  grade: GradeLevel;
  deviceTier: string;
  language: 'en' | 'zh-Hans';
}

export interface CapabilityManifest {
  name: string;
  title: Record<'en' | 'zh-Hans', string>;
  stages: string[];
  tools: string[];
  modelTier: ModelTier;
}

export const CAPABILITY_MANIFESTS: Record<string, CapabilityManifest> = {
  photo_solve: {
    name: 'photo_solve',
    title: { en: 'Solve this problem', 'zh-Hans': '我来解题' },
    stages: ['读题', '想步骤', '写答案'],
    tools: ['ocr', 'gemma_reasoning', 'session_log'],
    modelTier: 'E4B',
  },
};

export const MODEL_ROUTING = {
  english:    { high: 'gemma-e4b', mid: 'gemma-e2b' },
  math:       { high: 'gemma-e4b', mid: 'gemma-e2b' },
  science:    { high: 'gemma-e4b', mid: 'gemma-e2b' },
  chinese_mt: { high: 'qwen-4b',   mid: 'qwen-2b' },
};

// ── Functions ──

export function buildPrompt(request: InferenceRequest): { system: string; user: string } {
  return {
    system: 'You are a patient primary-school tutor.',
    user: `Grade: ${request.grade}\nSubject: ${request.subject}\n\n${request.ocr.fullText}`,
  };
}

export function buildFollowUpPrompt(
  _originalQuestion: string,
  _responseSoFar: string,
  followUp: string,
  _language: 'en' | 'zh-Hans',
): { system: string; user: string } {
  return {
    system: 'You are a patient primary-school tutor.',
    user: `Follow-up: ${followUp}`,
  };
}

export function parseInferenceResponse(
  _rawOutput: string,
  _questionCount: number,
): InferenceResponse {
  return {
    sessionId: 'mock-session-123',
    createdAt: new Date().toISOString(),
    questions: [
      {
        questionIndex: 1,
        questionText: 'Mock question',
        detectedSubject: 'math',
        detectedTopic: 'Multiplication',
        hint: 'Try breaking the problem into smaller parts.',
        steps: [
          { step: 1, description: 'Step 1', working: 'working' },
          { step: 2, description: 'Step 2' },
        ],
        fullSolution: 'The answer is 42.',
      },
    ],
    subject: 'math',
    confidence: 0.95,
  };
}

// ── Inference Bridge ──

export class MockInferenceBridge {
  private _loaded = false;

  async loadModel(_tier: ModelTier): Promise<boolean> {
    this._loaded = true;
    return true;
  }

  async unloadModel(): Promise<void> {
    this._loaded = false;
  }

  isReady(): boolean {
    return this._loaded;
  }

  async infer(_request: InferenceRequest): Promise<InferenceResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return parseInferenceResponse('{}', 1);
  }
}
