/**
 * Inference Bridge — abstraction over the on-device LLM.
 *
 * Defines the interface for running inference with Gemma (iOS: ExecuTorch,
 * Android: LiteRT-LM) or Qwen for Chinese MT tasks. The mock implementation
 * returns realistic responses for development until the real runtime is integrated.
 *
 * From ARCHITECTURE.md §3.3: Each feature declares a modelTier in its manifest.
 * photo_solve requires E4B; if the device is mid-tier, the router downgrades to E2B.
 *
 * @see types.ts — InferenceRequest, InferenceResponse
 * @see prompt-builder.ts — buildPrompt
 * @see response-parser.ts — parseInferenceResponse
 */

import type { InferenceRequest, InferenceResponse, ModelTier } from './types';
import { buildPrompt } from './prompt-builder';

import { MOCK_RESPONSES } from './mock-data';

// ── Interface ──────────────────────────────────────────────────────

export interface InferenceBridge {
  /**
   * Run inference on a homework photo (OCR input → structured response).
   * Returns null if inference is not available (model not downloaded yet).
   */
  infer(request: InferenceRequest): Promise<InferenceResponse>;

  /**
   * Check if inference is ready (model loaded, runtime available).
   */
  isReady(): boolean;

  /**
   * Load the inference model. Called after model download completes.
   */
  loadModel(tier: ModelTier): Promise<boolean>;

  /**
   * Unload the model to free memory.
   */
  unloadModel(): Promise<void>;
}

// ── Mock Implementation ────────────────────────────────────────────

/**
 * Mock inference bridge for development/testing.
 *
 * Returns pre-defined realistic responses based on the OCR text content
 * (matched by keyword). Falls back to a generic response if no match.
 */
export class MockInferenceBridge implements InferenceBridge {
  private _loaded = false;
  private _tier: ModelTier | null = null;

  async loadModel(tier: ModelTier): Promise<boolean> {
    // Simulate model loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    this._loaded = true;
    this._tier = tier;
    return true;
  }

  async unloadModel(): Promise<void> {
    this._loaded = false;
    this._tier = null;
  }

  isReady(): boolean {
    return this._loaded;
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this._loaded) {
      // Auto-load on first inference in mock mode
      await this.loadModel('E4B');
    }

    // Simulate inference delay (matches P95 target: <8s on high tier)
    const delay = request.deviceTier === 'high' ? 2000 : 4000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Build prompt (for mock, we use it to match keywords)
    const prompt = buildPrompt(request);

    // Try to find a matching mock response
    const match = findMockResponse(prompt.user);

    if (match) {
      return {
        ...match,
        sessionId: match.sessionId,
        createdAt: new Date().toISOString(),
      };
    }

    // Generic fallback response
    const questionCount = request.questions?.length ?? 1;
    return buildGenericMockResponse(questionCount, request.subject);
  }
}

// ── Mock Response Matching ─────────────────────────────────────────

function findMockResponse(ocrText: string): InferenceResponse | null {
  const lower = ocrText.toLowerCase();

  // Try exact matches first
  for (const [keywords, response] of Object.entries(MOCK_RESPONSES)) {
    const matchAll = keywords
      .toLowerCase()
      .split(',')
      .map((k) => k.trim())
      .every((k) => lower.includes(k));

    if (matchAll) {
      // Return a fresh copy with new timestamps
      return {
        ...response,
        sessionId: response.sessionId,
        createdAt: new Date().toISOString(),
      };
    }
  }

  return null;
}

// ── Generic Fallback ───────────────────────────────────────────────

function buildGenericMockResponse(
  questionCount: number,
  subject: InferenceRequest['subject'],
): InferenceResponse {
  const questions = Array.from({ length: Math.min(questionCount, 3) }, (_, i) => ({
    questionIndex: i + 1,
    questionText: `Question ${i + 1} from your homework`,
    hint: 'Think about what the question is asking. What information do you already know? Try breaking the problem into smaller parts.',
    steps: [
      {
        step: 1,
        description: 'Read the question carefully and identify the key information.',
      },
      {
        step: 2,
        description: 'Think about which method or formula to use.',
      },
      {
        step: 3,
        description: 'Work through the solution step by step, checking your work as you go.',
      },
    ],
    fullSolution: 'The step-by-step solution shows how to arrive at the answer. Check if your working matches each step.',
    detectedSubject: subject === 'auto' ? 'math' : subject,
    detectedTopic: 'General problem solving',
  }));

  return {
    sessionId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    questions,
    subject: subject === 'auto' ? 'math' : subject,
    confidence: 0.85,
  };
}
