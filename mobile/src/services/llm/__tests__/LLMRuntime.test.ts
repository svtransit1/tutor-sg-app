let mockLoadModel = jest.fn(); let mockGenerate = jest.fn();
jest.mock('expo-modules-core', () => { const mockAL = jest.fn().mockReturnValue({ remove: jest.fn() }); return { __registerMock: jest.fn(), requireNativeModule: jest.fn().mockReturnValue({ loadModel: jest.fn().mockImplementation((...a) => mockLoadModel(...a)), generate: jest.fn().mockImplementation((...a) => mockGenerate(...a)), unloadModel: jest.fn().mockResolvedValue(undefined), getState: jest.fn().mockReturnValue('ready'), getLoadedModelId: jest.fn().mockReturnValue('gemma-e2b-test'), isReady: jest.fn().mockReturnValue(true), addListener: jest.fn(), removeListeners: jest.fn() }), requireOptionalNativeModule: jest.fn(), EventEmitter: jest.fn().mockImplementation(() => ({ addListener: mockAL })), default: { __registerMock: jest.fn(), requireNativeModule: jest.fn() } }; });
import { load, generate, unload, getState, getLoadedModelId, reset, onToken } from '../LLMRuntime';
beforeEach(() => { jest.clearAllMocks(); reset(); mockLoadModel.mockResolvedValue({ success: true, modelId: 'gemma-e2b-test', state: 'ready', message: 'OK' }); mockGenerate.mockImplementation(async () => ({ text: 'I can help.', tokenCount: 8, latencyMs: 150, tokensPerSecond: 53 })); });
afterEach(() => { reset(); jest.restoreAllMocks(); });
describe('load', () => {
  it('calls native with correct args', async () => { const r = await load({ modelPath: '/m.tflite', tier: 'mid' }); expect(mockLoadModel).toHaveBeenCalledWith('/m.tflite', 'mid'); expect(r.success).toBe(true); });
  it('sets loadedModelId', async () => { await load({ modelPath: '/m.tflite' }); expect(getLoadedModelId()).toBe('gemma-e2b-test'); });
  it('handles native failure', async () => { mockLoadModel.mockRejectedValueOnce(new Error('bad')); const r = await load({ modelPath: '/b.tflite' }); expect(r.success).toBe(false); });
  it('defaults to mid tier', async () => { await load({ modelPath: '/m.tflite' }); expect(mockLoadModel).toHaveBeenCalledWith('/m.tflite', 'mid'); });
});
describe('generate', () => {
  beforeEach(async () => { await load({ modelPath: '/m.tflite' }); });
  it('calls native', async () => { await generate({ prompt: '?' }); expect(mockGenerate).toHaveBeenCalled(); });
  it('returns result', async () => { mockGenerate.mockResolvedValueOnce({ text: '4', tokenCount: 1, latencyMs: 50, tokensPerSecond: 20 }); const r = await generate({ prompt: '?' }); expect(r.text).toBe('4'); });
  it('accepts callback', async () => { const r = await generate({ prompt: 'Hi' }, jest.fn()); expect(r.text).toBeTruthy(); });
  it('throws if not loaded', async () => { await unload(); await expect(generate({ prompt: 'T' })).rejects.toThrow(/not ready/); });
});
describe('unload', () => {
  it('calls native and resets state', async () => { await load({ modelPath: '/m.tflite' }); await unload(); expect(getState()).toBe('uninitialized'); expect(getLoadedModelId()).toBeNull(); });
});
describe('events', () => {
  it('onToken add/remove', () => { const f = jest.fn(); const u = onToken(f); u(); expect(f).not.toHaveBeenCalled(); });
});
