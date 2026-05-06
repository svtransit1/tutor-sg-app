/**
 * Mock for expo-speech module.
 * Jest auto-resolves this when using jest.mock('expo-speech') without factory.
 * Also used via moduleNameMapper mapping in jest.config.js.
 */
import { createExpoSpeechMock } from './expo-speech-factory';

const mock = createExpoSpeechMock();
export const {
  speak,
  stop,
  pause,
  resume,
  isSpeakingAsync,
  getAvailableVoicesAsync,
  $reset,
  $text,
  $done,
  $fail,
  __resetMockState: resetMockState,
  __getCurrentText: getCurrentText,
  __simulateDone: simulateDone,
  __simulateError: simulateError,
} = mock;

// Re-export for type consistency with jest.requireMock
export default mock;
