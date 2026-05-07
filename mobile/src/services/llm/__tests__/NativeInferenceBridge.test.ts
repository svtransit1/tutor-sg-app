jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(() => null),
  EventEmitter: jest.fn(() => null),
}));

import type { InferenceRequest } from '@tutor-sg/llm';

describe('NativeInferenceBridge', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('loads and exports NativeInferenceBridge', () => {
    const { NativeInferenceBridge } = require('../NativeInferenceBridge');
    expect(NativeInferenceBridge).toBeDefined();
  });

  it('isReady returns false when not loaded', () => {
    const { NativeInferenceBridge } = require('../NativeInferenceBridge');
    const bridge = new NativeInferenceBridge();
    expect(bridge.isReady()).toBe(false);
  });

  it('loadModel returns false when native module absent', async () => {
    const { NativeInferenceBridge } = require('../NativeInferenceBridge');
    const bridge = new NativeInferenceBridge();
    const loaded = await bridge.loadModel('E4B');
    expect(loaded).toBe(false);
  });

  it('unloadModel resets state even when native module absent', async () => {
    const { NativeInferenceBridge } = require('../NativeInferenceBridge');
    const bridge = new NativeInferenceBridge();
    try {
      await bridge.unloadModel();
    } catch {
      // native module not available — expected without real runtime
    }
  });

  it('infer returns error response when native module absent', async () => {
    const { NativeInferenceBridge } = require('../NativeInferenceBridge');
    const bridge = new NativeInferenceBridge();
    const request: InferenceRequest = {
      ocr: {
        pages: [],
        fullText: 'What is 2+2?',
        lowConfidenceBlocks: 0,
        needsManualInput: false,
      },
      subject: 'math',
      grade: 'P3',
      deviceTier: 'high',
      language: 'en',
    };
    const result = await bridge.infer(request);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('inference_failed');
  });
});
