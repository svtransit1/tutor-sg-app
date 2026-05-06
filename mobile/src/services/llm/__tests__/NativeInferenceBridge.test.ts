/**
 * Tests for NativeInferenceBridge.
 *
 * Verifies that the bridge correctly:
 * - Loads models with the right tier/path
 * - Builds prompts and generates responses
 * - Handles model switching per subject
 * - Falls back to error objects on failure
 */
import { NativeModules, NativeEventEmitter } from 'react-native';
import { NativeInferenceBridge } from '../NativeInferenceBridge';
import { reset } from '../LLMRuntime';

// ── Mocks ──────────────────────────────────────────────────────────

jest.mock('@tutor-sg/llm', () => ({
  buildPrompt: jest.fn().mockReturnValue({
    system: 'You are a helpful tutor.',
    user: 'Solve: 2 + 2 = ?',
    maxTokens: 1024,
    temperature: 0.7,
  }),
  parseInferenceResponse: jest.fn().mockReturnValue({
    questions: [
      {
        questionIndex: 1,
        questionText: '2 + 2 = ?',
        hint: 'Try counting on your fingers',
        steps: [{ step: 1, description: 'Start with 2, add 2 more' }],
        fullSolution: '2 + 2 = 4',
      },
    ],
    subject: 'math',
    confidence: 0.95,
  }),
  resolveModel: jest.fn().mockReturnValue('gemma-e4b'),
}));

jest.mock('@tutor-sg/device-tier', () => ({}));

// Mock LLMRuntime functions
const mockLoad = jest.fn();
const mockGenerate = jest.fn();
const mockUnload = jest.fn();
const mockGetState = jest.fn();

jest.mock('../LLMRuntime', () => ({
  ...jest.requireActual('../LLMRuntime'),
  LLMRuntime: {
    load: (...args: any[]) => mockLoad(...args),
    generate: (...args: any[]) => mockGenerate(...args),
    unload: (...args: any[]) => mockUnload(...args),
  },
  getState: () => mockGetState(),
  reset: jest.fn(),
}));

function createMockEmitter() {
  const listeners = new Map<string, Set<(...a: any[]) => void>>();
  return {
    addListener: jest.fn((t: string, l: (...a: any[]) => void) => {
      if (!listeners.has(t)) listeners.set(t, new Set());
      listeners.get(t)!.add(l);
      return { remove: jest.fn(() => { listeners.get(t)?.delete(l); }) };
    }),
    emit: jest.fn((t: string, ...a: any[]) => { listeners.get(t)?.forEach(f => f(...a)); }),
    removeAllListeners: jest.fn(), removeSubscription: jest.fn(),
  };
}

let mockEmitter: ReturnType<typeof createMockEmitter>;

beforeEach(() => {
  jest.clearAllMocks();
  reset();
  mockEmitter = createMockEmitter();
  (NativeModules as any).LLMRuntime = { loadModel: jest.fn(), generate: jest.fn(), unloadModel: jest.fn() };
  (NativeEventEmitter as jest.Mock).mockImplementation(() => mockEmitter);
  mockLoad.mockResolvedValue({ success: true, modelId: 'gemma-e4b', state: 'ready', message: 'OK' });
  mockGenerate.mockImplementation(async (_p: string, _m: number, _t: number) => {
    return { text: '{"result":"ok"}', tokenCount: 5, latencyMs: 500 };
  });
  mockUnload.mockResolvedValue(undefined);
  mockGetState.mockReturnValue('ready');
});

// ── Tests ──────────────────────────────────────────────────────────

describe('NativeInferenceBridge', () => {
  describe('loadModel', () => {
    it('loads model with correct path', async () => {
      const bridge = new NativeInferenceBridge('/models');
      const ok = await bridge.loadModel('E4B');
      expect(ok).toBe(true);
      expect(mockLoad).toHaveBeenCalledWith({
        modelPath: '/models/gemma-e4b.tflite',
        tier: 'high',
      });
    });

    it('returns false on load failure', async () => {
      mockLoad.mockResolvedValueOnce({ success: false, modelId: '', state: 'error' });
      const bridge = new NativeInferenceBridge('/models');
      const ok = await bridge.loadModel('E4B');
      expect(ok).toBe(false);
    });

    it('isReady returns true after successful load', async () => {
      const bridge = new NativeInferenceBridge('/models');
      await bridge.loadModel('E4B');
      expect(bridge.isReady()).toBe(true);
    });

    it('isReady returns false before load', () => {
      const bridge = new NativeInferenceBridge('/models');
      expect(bridge.isReady()).toBe(false);
    });
  });

  describe('infer', () => {
    it('auto-loads model if not loaded', async () => {
      const bridge = new NativeInferenceBridge('/models');
      const response = await bridge.infer({
        subject: 'math',
        gradeLevel: 'P3',
        deviceTier: 'high',
        ocrText: '2 + 2 = ?',
        questions: [{ index: 1, text: '2 + 2 = ?' }],
      } as any);
      expect(mockLoad).toHaveBeenCalled();
      expect(response.questions.length).toBe(1);
    });

    it('generates and parses response', async () => {
      const bridge = new NativeInferenceBridge('/models');
      await bridge.loadModel('E4B');
      const response = await bridge.infer({
        subject: 'math',
        gradeLevel: 'P3',
        deviceTier: 'high',
        ocrText: '2 + 2 = ?',
        questions: [{ index: 1, text: '2 + 2 = ?' }],
      } as any);
      expect(mockGenerate).toHaveBeenCalled();
      expect(response.questions[0].questionText).toBe('2 + 2 = ?');
      expect(response.confidence).toBe(0.95);
    });

    it('returns error on inference failure', async () => {
      mockGenerate.mockRejectedValueOnce(new Error('OOM'));
      const bridge = new NativeInferenceBridge('/models');
      await bridge.loadModel('E4B');
      const response = await bridge.infer({
        subject: 'math',
        gradeLevel: 'P3',
        deviceTier: 'high',
        ocrText: '2 + 2 = ?',
      } as any);
      expect(response.error?.code).toBe('inference_failed');
    });
  });

  describe('unloadModel', () => {
    it('unloads and resets state', async () => {
      const bridge = new NativeInferenceBridge('/models');
      await bridge.loadModel('E4B');
      expect(bridge.isReady()).toBe(true);
      await bridge.unloadModel();
      expect(mockUnload).toHaveBeenCalled();
      expect(bridge.isReady()).toBe(false);
    });
  });

  describe('model switching', () => {
    it('switches model when subject requires different model', async () => {
      // First load for math (Gemma)
      const bridge = new NativeInferenceBridge('/models');
      await bridge.loadModel('E4B');
      expect(mockLoad).toHaveBeenCalledTimes(1);

      // Then infer chinese_mt (Qwen) — should trigger model switch
      const { resolveModel } = require('@tutor-sg/llm');
      resolveModel.mockReturnValueOnce('qwen-4b');
      mockLoad.mockResolvedValueOnce({ success: true, modelId: 'qwen-4b', state: 'ready' });

      await bridge.infer({
        subject: 'chinese_mt',
        gradeLevel: 'P5',
        deviceTier: 'high',
        ocrText: '请解释这个句子',
      } as any);

      // Should unload old and load new
      expect(mockUnload).toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledTimes(2);
      expect(mockLoad).toHaveBeenLastCalledWith({
        modelPath: '/models/qwen-4b.tflite',
        tier: 'high',
      });
    });
  });
});
