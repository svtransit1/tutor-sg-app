/**
 * Jest setup file — runs before every test suite.
 * Global mocks and shared utilities.
 */

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const FALLBACKS: Record<string, string> = {
        'common.back': 'Back',
        'common.goBack': 'Go back',
        'homeworkFeedback.title': 'Homework Feedback',
        'homeworkFeedback.questionLabel': 'Question {{number}}',
        'homeworkFeedback.tabHint': 'Hint',
        'homeworkFeedback.tabSteps': 'Steps',
        'homeworkFeedback.tabSolution': 'Solution',
        'homeworkFeedback.followUpTitle': 'Great question! Let me help you with that.',
        'homeworkFeedback.textPlaceholder': 'Ask a follow-up question...',
        'homeworkFeedback.send': 'Send',
        'homeworkFeedback.voiceButton': 'Record voice',
        'homeworkFeedback.voiceRecording': 'Recording...',
        'homeworkFeedback.voiceProcessing': 'Processing...',
        'homeworkFeedback.voiceError': 'Try again',
        'homeworkFeedback.voiceRetry': 'Retry',
        'homeworkFeedback.voicePermissionDenied': 'Microphone access needed',
        'homeworkFeedback.backToHome': 'Back to Home',
        'homeworkFeedback.voiceInputHint': 'Tap mic to ask a question',
        'homeworkFeedback.speakContent': 'Read aloud',
        'homeworkFeedback.stopSpeaking': 'Stop',
        'homeworkFeedback.accessibility.voiceButton': 'Record a voice question',
        'homeworkFeedback.accessibility.voiceRecording': 'Recording voice question',
        'homeworkFeedback.accessibility.voiceProcessing': 'Processing your question',
        'homeworkFeedback.accessibility.voiceError': 'Voice recording failed',
        'homeworkFeedback.accessibility.voicePermissionDenied': 'Microphone permission is required for voice input',
        'homeworkFeedback.accessibility.textInput': 'Type a follow-up question',
        'homeworkFeedback.accessibility.sendButton': 'Send message',
        'homeworkFeedback.accessibility.speakContent': 'Read the explanation aloud',
        'homeworkFeedback.accessibility.stopSpeaking': 'Stop reading',
      };
      let result = FALLBACKS[key] ?? key;
      if (options) {
        for (const [optKey, optVal] of Object.entries(options)) {
          result = result.replace(`{{${optKey}}}`, String(optVal));
        }
      }
      return result;
    },
  }),
}));

globalThis.waitForTick = () => new Promise((r) => setTimeout(r, 0));
export {};
