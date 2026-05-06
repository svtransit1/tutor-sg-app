import * as Speech from 'expo-speech';

/**
 * Supported language codes for TTS.
 * - English → BCP 47 'en-SG' (Singapore English)
 * - Simplified Chinese → BCP 47 'zh-CN' (Mandarin)
 */
export type TtsLanguage = 'en' | 'zh-Hans';

export type TtsState = 'idle' | 'speaking' | 'paused';

export interface TtsEventHandlers {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

type TtsVoice = Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>[number];

const LANGUAGE_MAP: Record<TtsLanguage, string> = {
  en: 'en-SG',
  'zh-Hans': 'zh-CN',
};

/**
 * TtsService — wraps expo-speech for bilingual text-to-speech.
 *
 * Speaks feedback text aloud in EN or zh-Hans.
 * Calling speak() while already speaking enqueues the text.
 *
 * Usage:
 *   TtsService.speak("Hello", 'en', { onDone: () => ... });
 *   await TtsService.stop();
 *   await TtsService.pause();
 *   await TtsService.resume();
 */
export const TtsService = {
  speak(text: string, language: TtsLanguage, handlers?: TtsEventHandlers): void {
    Speech.speak(text, {
      language: LANGUAGE_MAP[language],
      rate: 0.85,
      pitch: 1.0,
      onStart: handlers?.onStart,
      onDone: handlers?.onDone,
      onStopped: handlers?.onStopped,
      onError: (error: Error) => {
        handlers?.onError?.(error);
      },
    });
  },

  async stop(): Promise<void> {
    await Speech.stop();
  },

  async pause(): Promise<void> {
    await Speech.pause();
  },

  async resume(): Promise<void> {
    await Speech.resume();
  },

  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  },

  async getVoices(language?: TtsLanguage) {
    const allVoices = await Speech.getAvailableVoicesAsync();
    if (!language) return allVoices;
    const prefix = LANGUAGE_MAP[language].slice(0, 2);
    return allVoices.filter((v: TtsVoice) => v.language.startsWith(prefix));
  },
};

export default TtsService;
