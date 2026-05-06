/**
 * NativeInferenceBridge — Adapter that wires the LLMRuntime native module
 * into the @tutor-sg/llm InferenceBridge interface.
 *
 * This is the integration point for AAAS-44 (M2-7: first homework flow).
 * AAAS-44 consumes InferenceBridge; this file provides the real (non-mock)
 * implementation that talks to LiteRT-LM (Android) / ExecuTorch (iOS).
 *
 * Per ADD §3, ARCHITECTURE.md §3.2–3.4, packages/llm/src/inference-bridge.ts.
 */
import type {
  InferenceBridge,
  InferenceRequest,
  InferenceResponse,
  ModelTier,
} from '@tutor-sg/llm';
import { buildPrompt, parseInferenceResponse } from '@tutor-sg/llm';
import { resolveModel } from '@tutor-sg/llm';
import { LLMRuntime, getState } from './LLMRuntime';
import type { DeviceTier } from '@tutor-sg/device-tier';

// ── Constants ──────────────────────────────────────────────────────

/** Maps @tutor-sg/llm ModelTier to LLMRuntime tier strings. */
const TIER_MAP: Record<ModelTier, 'high' | 'mid'> = {
  E4B: 'high',
  E2B: 'mid',
  'Qwen-4B': 'high',
  'Qwen-2B': 'mid',
};

/** Maps @tutor-sg/llm SubjectId to LLMRuntime subject key for model routing. */
const SUBJECT_MAP: Record<
  InferenceRequest['subject'],
  'english' | 'math' | 'science' | 'chinese_mt'
> = {
  english: 'english',
  math: 'math',
  science: 'science',
  chinese_mt: 'chinese_mt',
  auto: 'english', // default for auto-detect
};

// ── NativeInferenceBridge ──────────────────────────────────────────

/**
 * Native inference bridge backed by the LiteRT-LM / ExecuTorch runtime.
 *
 * Lifecycle:
 *   1. loadModel(tier) → resolves model ID, calls LLMRuntime.load()
 *   2. infer(request)  → builds prompt, calls LLMRuntime.generate(), parses response
 *   3. unloadModel()   → calls LLMRuntime.unload() to free native memory
 */
export class NativeInferenceBridge implements InferenceBridge {
  private _loaded = false;
  private _currentTier: ModelTier | null = null;
  private _modelPath: string | null = null;

  /**
   * @param modelsBaseDir Base directory where model files are stored
   *                      (set by model download service, defaults to app storage).
   */
  constructor(private modelsBaseDir: string = '') {}

  // ── InferenceBridge implementation ───────────────────────────────

  async loadModel(tier: ModelTier): Promise<boolean> {
    if (this._loaded && this._currentTier === tier) return true;

    try {
      // Resolve model ID from tier (e.g. 'E4B' → 'gemma-e4b')
      const subject = 'math'; // Default subject for model loading;
                               // switched per request in infer().
      const deviceTier = TIER_MAP[tier];
      const modelId = resolveModel(
        SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP] ?? 'english',
        deviceTier,
      );

      // Construct model path from base directory
      const modelPath = this._buildModelPath(modelId);

      // Load into native runtime
      const result = await LLMRuntime.load({
        modelPath,
        tier: deviceTier,
      });

      if (result.success) {
        this._loaded = true;
        this._currentTier = tier;
        this._modelPath = modelPath;
        return true;
      }

      console.error('[NativeInferenceBridge] Failed to load model:', result.message);
      return false;
    } catch (err) {
      console.error('[NativeInferenceBridge] loadModel error:', err);
      return false;
    }
  }

  isReady(): boolean {
    return this._loaded && getState() === 'ready';
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    // Auto-load if not loaded
    if (!this._loaded) {
      const tier = request.deviceTier === 'high' ? 'E4B' : 'E2B';
      const loaded = await this.loadModel(tier);
      if (!loaded) {
        return {
          sessionId: `err-${Date.now()}`,
          createdAt: new Date().toISOString(),
          questions: [],
          subject: request.subject === 'auto' ? 'math' : request.subject,
          confidence: 0,
          error: {
            code: 'inference_failed',
            message: 'Model could not be loaded. Please re-download the model.',
            messageZh: '模型无法加载。请重新下载模型。',
          },
        };
      }
    }

    try {
      // Build the structured prompt from the request
      const prompt = buildPrompt(request);

      // Resolve model ID for this specific subject
      const subject = request.subject === 'auto' ? 'math' : request.subject;
      const deviceTier: 'high' | 'mid' =
        request.deviceTier === 'high' ? 'high' : 'mid';

      // If the subject requires a different model, reload
      const targetModelId = resolveModel(
        SUBJECT_MAP[subject],
        deviceTier,
      );
      const targetPath = this._buildModelPath(targetModelId);

      if (targetPath !== this._modelPath && this._loaded) {
        // Model switch needed (e.g. Gemma → Qwen for Chinese MT)
        await LLMRuntime.unload();
        this._loaded = false;
        const loaded = await LLMRuntime.load({
          modelPath: targetPath,
          tier: deviceTier,
        });
        if (!loaded.success) {
          throw new Error(`Failed to load model: ${targetModelId}`);
        }
        this._modelPath = targetPath;
        this._loaded = true;
      }

      // Concatenate system + user prompt for the native module
      const fullPrompt = prompt.system
        ? `${prompt.system}\n\n${prompt.user}`
        : prompt.user;

      // Collect tokens for streaming (optional — AAAS-44 can use the callback)
      let streamedText = '';
      const response = await LLMRuntime.generate(
        {
          prompt: fullPrompt,
          maxTokens: prompt.maxTokens ?? 1024,
          temperature: prompt.temperature ?? 0.7,
        },
        (chunk) => {
          streamedText += chunk.token;
        },
      );

      // Parse the LLM output into structured InferenceResponse
      const parsed = parseInferenceResponse(response.text, request);
      return {
        ...parsed,
        sessionId: `native-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[NativeInferenceBridge] inference error:', err);
      return {
        sessionId: `err-${Date.now()}`,
        createdAt: new Date().toISOString(),
        questions: [],
        subject: request.subject === 'auto' ? 'math' : request.subject,
        confidence: 0,
        error: {
          code: 'inference_failed',
          message: `Inference failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          messageZh: '推理失败。请重试。',
        },
      };
    }
  }

  async unloadModel(): Promise<void> {
    try {
      await LLMRuntime.unload();
    } catch (err) {
      console.error('[NativeInferenceBridge] unload error:', err);
    } finally {
      this._loaded = false;
      this._currentTier = null;
      this._modelPath = null;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────

  /**
   * Build the expected file path for a model ID.
   * Model files are stored under modelsBaseDir with .tflite extension.
   */
  private _buildModelPath(modelId: string): string {
    const base = this.modelsBaseDir || '/data/models';
    return `${base}/${modelId}.tflite`;
  }
}
