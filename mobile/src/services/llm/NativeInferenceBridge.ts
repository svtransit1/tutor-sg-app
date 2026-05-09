import type {
  InferenceBridge,
  InferenceRequest,
  InferenceResponse,
  ModelTier,
  SubjectId,
} from '@tutor-sg/llm';
import { buildPrompt, parseInferenceResponse, resolveModel } from '@tutor-sg/llm';
import { LLMRuntime, getState, onToken } from './LLMRuntime';
import { mark } from '@tutor-sg/perf';

const TIER_MAP: Record<ModelTier, 'high' | 'mid'> = {
  E4B: 'high',
  E2B: 'mid',
};

export class NativeInferenceBridge implements InferenceBridge {
  private _loaded = false;
  private _currentTier: ModelTier | null = null;
  private _modelPath: string | null = null;

  constructor(private modelsBaseDir: string = '') {}

  async loadModel(tier: ModelTier): Promise<boolean> {
    if (this._loaded && this._currentTier === tier) return true;
    try {
      const deviceTier = TIER_MAP[tier] ?? 'mid';
      const modelId = resolveModel('math', deviceTier);
      const modelPath = this._buildModelPath(modelId);
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
      return false;
    } catch {
      return false;
    }
  }

  isReady(): boolean {
    return this._loaded && getState() === 'ready';
  }

  async infer(request: InferenceRequest, onFirstToken?: () => void): Promise<InferenceResponse> {
    if (!this._loaded) {
      const loaded = await this.loadModel(
        request.deviceTier === 'high' ? ('E4B' as ModelTier) : ('E2B' as ModelTier),
      );
      if (!loaded) {
        return {
          sessionId: `err-${Date.now()}`,
          createdAt: new Date().toISOString(),
          questions: [],
          subject: request.subject === 'auto' ? ('math' as SubjectId) : request.subject,
          confidence: 0,
          error: {
            code: 'inference_failed',
            message: 'Model could not be loaded.',
            messageZh: '模型无法加载。',
          },
        };
      }
    }

    try {
      const prompt = buildPrompt(request);
      const subject = request.subject === 'auto' ? ('math' as SubjectId) : request.subject;
      const deviceTier: 'high' | 'mid' = request.deviceTier === 'high' ? 'high' : 'mid';
      const targetModelId = resolveModel(subject, deviceTier);
      const targetPath = this._buildModelPath(targetModelId);

      if (targetPath !== this._modelPath && this._loaded) {
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

      const fullPrompt = prompt.system ? `${prompt.system}\n\n${prompt.user}` : prompt.user;
      let firstTokenFired = false;
      const response = await LLMRuntime.generate(
        {
          prompt: fullPrompt,
          maxTokens: 1024,
          temperature: 0.7,
        },
        (chunk) => {
          if (!firstTokenFired && chunk.index === 0) {
            firstTokenFired = true;
            mark('first_llm_token');
            onFirstToken?.();
          }
        },
      );
      const questionCount = request.questions?.length ?? 1;
      const parsed = parseInferenceResponse(response.text, questionCount);
      return {
        ...parsed,
        sessionId: `native-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        sessionId: `err-${Date.now()}`,
        createdAt: new Date().toISOString(),
        questions: [],
        subject: request.subject === 'auto' ? ('math' as SubjectId) : request.subject,
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
    } catch {
      // native module unavailable during test/dev — still reset state
    } finally {
      this._loaded = false;
      this._currentTier = null;
      this._modelPath = null;
    }
  }

  private _buildModelPath(modelId: string): string {
    const base = this.modelsBaseDir || '/data/models';
    return `${base}/${modelId}.tflite`;
  }
}
