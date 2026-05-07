let mockLM = jest.fn(); let mockGen = jest.fn(); let mockUL = jest.fn();
jest.mock('expo-modules-core', () => ({ __registerMock: jest.fn(), requireNativeModule: jest.fn().mockReturnValue({ loadModel: jest.fn().mockImplementation((...a) => mockLM(...a)), generate: jest.fn().mockImplementation((...a) => mockGen(...a)), unloadModel: jest.fn().mockImplementation((...a) => mockUL(...a)), getState: jest.fn().mockReturnValue('ready'), getLoadedModelId: jest.fn().mockReturnValue('g'), isReady: jest.fn().mockReturnValue(true), addListener: jest.fn(), removeListeners: jest.fn() }), requireOptionalNativeModule: jest.fn(), EventEmitter: jest.fn().mockReturnValue({ addListener: jest.fn().mockReturnValue({ remove: jest.fn() }) }), default: { __registerMock: jest.fn(), requireNativeModule: jest.fn() } }));
jest.mock('@tutor-sg/llm', () => ({ buildPrompt: jest.fn().mockReturnValue({ system: 't', user: 'u' }), parseInferenceResponse: jest.fn().mockReturnValue({ questions: [{ questionIndex: 1, questionText: '2+2=?', hint: 'count', steps: [{ step: 1, description: 'S' }], fullSolution: '4' }], subject: 'math', confidence: 0.95 }), resolveModel: jest.fn().mockReturnValue('gemma-e4b'), CAPABILITY_MANIFESTS: {}, MODEL_ROUTING: {} }));
import { NativeInferenceBridge } from '../NativeInferenceBridge'; import { reset } from '../LLMRuntime';
beforeEach(() => { jest.clearAllMocks(); reset(); mockLM.mockResolvedValue({ success: true, modelId: 'g', state: 'ready' }); mockGen.mockImplementation(async () => ({ text: '{"ok":1}', tokenCount: 5, latencyMs: 500, tokensPerSecond: 10 })); mockUL.mockResolvedValue(undefined); });
describe('NativeInferenceBridge', () => {
  describe('loadModel', () => {
    it('loads model with correct path', async () => { const b = new NativeInferenceBridge('/m'); const ok = await b.loadModel('E4B'); expect(ok).toBe(true); expect(mockLM).toHaveBeenCalledWith('/m/gemma-e4b.tflite', 'high'); });
    it('returns false on failure', async () => { mockLM.mockResolvedValueOnce({ success: false, modelId: '', state: 'error' }); const b = new NativeInferenceBridge('/m'); expect(await b.loadModel('E4B')).toBe(false); });
    it('isReady after load', async () => { const b = new NativeInferenceBridge('/m'); await b.loadModel('E4B'); expect(b.isReady()).toBe(true); });
    it('isReady false before load', () => { expect(new NativeInferenceBridge('/m').isReady()).toBe(false); });
  });
  describe('infer', () => {
    it('auto-loads', async () => { const b = new NativeInferenceBridge('/m'); const r = await b.infer({ ocr: { pages: [], fullText: '2+2=?', lowConfidenceBlocks: 0, needsManualInput: false }, subject: 'math', grade: 'P3', deviceTier: 'high', language: 'en', questions: [{ index: 1, text: '?', confidence: 0.95 }] }); expect(mockLM).toHaveBeenCalled(); expect(r.questions).toHaveLength(1); });
    it('generates and parses', async () => { const b = new NativeInferenceBridge('/m'); await b.loadModel('E4B'); const r = await b.infer({ ocr: { pages: [], fullText: '2+2=?', lowConfidenceBlocks: 0, needsManualInput: false }, subject: 'math', grade: 'P3', deviceTier: 'high', language: 'en', questions: [{ index: 1, text: '?', confidence: 0.95 }] }); expect(mockGen).toHaveBeenCalled(); expect(r.questions[0].questionText).toBe('2+2=?'); expect(r.confidence).toBe(0.95); });
    it('returns error on failure', async () => { mockGen.mockRejectedValueOnce(new Error('OOM')); const b = new NativeInferenceBridge('/m'); await b.loadModel('E4B'); const r = await b.infer({ ocr: { pages: [], fullText: '?', lowConfidenceBlocks: 0, needsManualInput: false }, subject: 'math', grade: 'P3', deviceTier: 'high', language: 'en' }); expect(r.error?.code).toBe('inference_failed'); });
  });
  describe('unloadModel', () => {
    it('unloads and resets state', async () => { const b = new NativeInferenceBridge('/m'); await b.loadModel('E4B'); expect(b.isReady()).toBe(true); await b.unloadModel(); expect(mockUL).toHaveBeenCalled(); expect(b.isReady()).toBe(false); });
  });
  describe('model switch', () => {
    it('switches model for different subject', async () => { const b = new NativeInferenceBridge('/m'); await b.loadModel('E4B'); expect(mockLM).toHaveBeenCalledTimes(1); const { resolveModel } = require('@tutor-sg/llm'); resolveModel.mockReturnValueOnce('qwen-4b'); mockLM.mockResolvedValueOnce({ success: true, modelId: 'q', state: 'ready' }); await b.infer({ ocr: { pages: [], fullText: '请', lowConfidenceBlocks: 0, needsManualInput: false }, subject: 'chinese_mt', grade: 'P5', deviceTier: 'high', language: 'zh-Hans' }); expect(mockUL).toHaveBeenCalled(); expect(mockLM).toHaveBeenCalledTimes(2); expect(mockLM).toHaveBeenLastCalledWith('/m/qwen-4b.tflite', 'high'); });
  });
});
