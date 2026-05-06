const { __registerMock } = jest.requireMock('expo-modules-core') as {
  __registerMock: (moduleName: string, mock: unknown) => void;
};

__registerMock('LitertLm', {
  getDeviceCapabilities: jest
    .fn()
    .mockResolvedValue({ tier: 'high', ramGB: 8, npuAvailable: true }),
  loadModel: jest.fn().mockResolvedValue({ modelId: 'gemma-e4b', loadTimeMs: 1500 }),
  getModelInfo: jest
    .fn()
    .mockResolvedValue({ modelId: 'gemma-e4b', loaded: true, contextLength: 4096 }),
  unloadModel: jest.fn().mockResolvedValue(undefined),
  generate: jest.fn().mockResolvedValue('Mock response.'),
});

__registerMock('TutorSgOcr', {
  recognizeText: jest.fn().mockResolvedValue({
    fullText: 'Mock OCR',
    blocks: [],
    imageSize: { width: 1920, height: 1080 },
    error: null,
  }),
  isOcrAvailable: jest.fn().mockReturnValue(true),
});

(globalThis as any).waitForTick = () => new Promise((r) => setTimeout(r, 0));
export {};
