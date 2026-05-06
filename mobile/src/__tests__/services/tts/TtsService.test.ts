import TtsService from '../../../services/tts/TtsService';

let mockSpeaking = false;
let mockText = '';
let mockCallback: {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (mockError: Error) => void;
} | null = null;

jest.mock('expo-speech', () => ({
  speak: (text: string, options?: Record<string, unknown>) => {
    mockText = text;
    mockSpeaking = true;
    mockCallback = {
      onStart: options?.onStart as () => void,
      onDone: options?.onDone as () => void,
      onStopped: options?.onStopped as () => void,
      onError: options?.onError as (mockError: Error) => void,
    };
    mockCallback.onStart?.();
  },
  stop: async () => {
    mockSpeaking = false;
    mockCallback?.onStopped?.();
    mockCallback = null;
    mockText = '';
  },
  pause: async () => {},
  resume: async () => {},
  isSpeakingAsync: async () => mockSpeaking,
  getAvailableVoicesAsync: async () => [
    { identifier: 'en-female', name: 'English Female', quality: 'Enhanced', language: 'en-SG' },
    { identifier: 'zh-female', name: 'Chinese Female', quality: 'Enhanced', language: 'zh-CN' },
  ],
  $reset: () => {
    mockSpeaking = false;
    mockText = '';
    mockCallback = null;
  },
  $text: () => mockText,
  $done: () => {
    mockSpeaking = false;
    mockCallback?.onDone?.();
    mockCallback = null;
    mockText = '';
  },
  $fail: (error: Error) => {
    mockSpeaking = false;
    mockCallback?.onError?.(error);
    mockCallback = null;
    mockText = '';
  },
}));

const mockSpeech = jest.requireMock('expo-speech') as {
  $reset: () => void;
  $text: () => string;
  $done: () => void;
  $fail: (x: Error) => void;
};

beforeEach(() => {
  mockSpeech.$reset();
});

describe('TtsService', () => {
  describe('speak()', () => {
    it('speaks text via expo-speech', () => {
      TtsService.speak('Hello!', 'en');
      expect(mockSpeech.$text()).toBe('Hello!');
    });

    it('fires onStart callback when speech starts', () => {
      const onStart = jest.fn();
      TtsService.speak('Test', 'en', { onStart });
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('fires onDone callback when speech completes', () => {
      const onDone = jest.fn();
      TtsService.speak('Test', 'en', { onDone });
      mockSpeech.$done();
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('fires onError callback on speech error', () => {
      const onError = jest.fn();
      TtsService.speak('Test', 'en', { onError });
      mockSpeech.$fail(new Error('TTS failed'));
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('fires onStopped callback on stop', () => {
      const onStopped = jest.fn();
      TtsService.speak('Test', 'en', { onStopped });
      TtsService.stop();
      expect(onStopped).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop()', () => {
    it('stops speech', async () => {
      TtsService.speak('Hello', 'en');
      await TtsService.stop();
      expect(await TtsService.isSpeaking()).toBe(false);
    });
  });

  describe('pause() / resume()', () => {
    it('pause does not throw', async () => {
      TtsService.speak('Hello', 'en');
      await expect(TtsService.pause()).resolves.not.toThrow();
    });

    it('resume does not throw', async () => {
      TtsService.speak('Hello', 'en');
      await expect(TtsService.resume()).resolves.not.toThrow();
    });
  });

  describe('isSpeaking()', () => {
    it('returns false when idle', async () => {
      expect(await TtsService.isSpeaking()).toBe(false);
    });

    it('returns true while speaking', async () => {
      TtsService.speak('Hello', 'en');
      expect(await TtsService.isSpeaking()).toBe(true);
    });
  });

  describe('getVoices()', () => {
    it('returns voices', async () => {
      const voices = await TtsService.getVoices();
      expect(voices.length).toBeGreaterThanOrEqual(1);
    });

    it('filters voices by language prefix', async () => {
      const enVoices = await TtsService.getVoices('en');
      expect(enVoices.every((v: { language: string }) => v.language.startsWith('en'))).toBe(true);
      const zhVoices = await TtsService.getVoices('zh-Hans');
      expect(zhVoices.every((v: { language: string }) => v.language.startsWith('zh'))).toBe(true);
    });
  });
});
