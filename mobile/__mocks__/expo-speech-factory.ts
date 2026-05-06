/**
 * Factory for expo-speech Jest mock.
 * Exported as a factory function to avoid jest.mock hoisting scope issues.
 */
export function mockExpoSpeechFactory() {
  let mockSpeaking = false;
  let mockText = '';
  let mockCb: {
    onStart?: () => void;
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (...args: unknown[]) => void;
  } | null = null;

  function reset() {
    mockSpeaking = false;
    mockText = '';
    mockCb = null;
  }

  function getText() {
    return mockText;
  }

  function simulateDone() {
    mockSpeaking = false;
    if (mockCb?.onDone) mockCb.onDone();
    mockCb = null;
    mockText = '';
  }

  function simulateError(error: Error) {
    mockSpeaking = false;
    if (mockCb?.onError) mockCb.onError(error);
    mockCb = null;
    mockText = '';
  }

  return {
    // expo-speech API
    speak: (text: string, options?: Record<string, unknown>) => {
      mockText = text;
      mockSpeaking = true;
      mockCb = {
        onStart: options?.onStart as () => void,
        onDone: options?.onDone as () => void,
        onStopped: options?.onStopped as () => void,
        onError: options?.onError as (...args: unknown[]) => void,
      };
      if (mockCb.onStart) mockCb.onStart();
    },
    stop: async () => {
      mockSpeaking = false;
      if (mockCb?.onStopped) mockCb.onStopped();
      mockCb = null;
      mockText = '';
    },
    pause: async () => {},
    resume: async () => {},
    isSpeakingAsync: async () => mockSpeaking,
    getAvailableVoicesAsync: async () => [
      { identifier: 'en-female', name: 'English Female', quality: 'Enhanced', language: 'en-SG' },
      { identifier: 'zh-female', name: 'Chinese Female', quality: 'Enhanced', language: 'zh-CN' },
    ],

    // test helpers
    $reset: reset,
    $text: getText,
    $done: simulateDone,
    $fail: simulateError,
    __resetMockState: reset,
    __getCurrentText: getText,
    __simulateDone: simulateDone,
    __simulateError: simulateError,
  };
}
