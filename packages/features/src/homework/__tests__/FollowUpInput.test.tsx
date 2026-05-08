import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FollowUpInput } from '../FollowUpInput';
import type { FollowUpInputProps } from '../FollowUpInput';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        'homework.followUp.placeholder': 'Ask a follow-up question…',
        'homework.followUp.placeholderRecording': 'Recording… tap mic to stop',
        'homework.followUp.send': 'Send',
        'homework.followUp.mic': 'Voice input',
        'homework.followUp.micRecording': 'Recording — tap to stop',
        'homework.followUp.micProcessing': 'Processing speech…',
        'homework.followUp.micError': 'Voice input error — tap to retry',
      };
      return keys[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

const defaultProps: FollowUpInputProps = {
  onSend: jest.fn(),
  onMicPress: jest.fn(),
};

function renderInput(props: Partial<FollowUpInputProps> = {}) {
  return render(<FollowUpInput {...defaultProps} {...props} />);
}

describe('FollowUpInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders text input with placeholder', () => {
      const { getByPlaceholderText } = renderInput();
      expect(
        getByPlaceholderText('Ask a follow-up question…'),
      ).toBeTruthy();
    });

    it('renders mic button', () => {
      const { getByLabelText } = renderInput();
      expect(getByLabelText('Voice input')).toBeTruthy();
    });

    it('renders send button', () => {
      const { getByLabelText } = renderInput();
      expect(getByLabelText('Send')).toBeTruthy();
    });

    it('renders KeyboardAvoidingView', () => {
      const { UNSAFE_getByType } = renderInput();
      const { KeyboardAvoidingView } = require('react-native');
      expect(UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
    });
  });

  describe('text input', () => {
    it('accepts text input via onChangeText', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderInput({ onChangeText });
      const input = getByPlaceholderText('Ask a follow-up question…');
      fireEvent.changeText(input, 'How do I solve this?');
      expect(onChangeText).toHaveBeenCalledWith('How do I solve this?');
    });

    it('is disabled when recording', () => {
      const { getByPlaceholderText } = renderInput({ voiceState: 'recording' });
      const input = getByPlaceholderText('Recording… tap mic to stop');
      expect(input.props.editable).toBe(false);
    });

    it('reflects controlled value', () => {
      const { getByPlaceholderText } = renderInput({
        value: 'Hello world',
      });
      const input = getByPlaceholderText('Ask a follow-up question…');
      expect(input.props.value).toBe('Hello world');
    });
  });

  describe('send button', () => {
    it('calls onSend with trimmed text and clears via onChangeText', () => {
      const onSend = jest.fn();
      const onChangeText = jest.fn();
      const { getByLabelText } = renderInput({
        onSend,
        onChangeText,
        value: '  Help me!  ',
      });

      fireEvent.press(getByLabelText('Send'));

      expect(onSend).toHaveBeenCalledWith('Help me!');
      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('does not call onSend when text is empty', () => {
      const onSend = jest.fn();
      const { getByLabelText } = renderInput({ onSend, value: '' });

      fireEvent.press(getByLabelText('Send'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('calls onSend on submit editing', () => {
      const onSend = jest.fn();
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderInput({
        onSend,
        onChangeText,
        value: 'Test question',
      });
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent(input, 'submitEditing');

      expect(onSend).toHaveBeenCalledWith('Test question');
      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('is disabled when text is empty', () => {
      const { getByLabelText } = renderInput({ value: '' });
      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(true);
    });

    it('is enabled when text is non-empty', () => {
      const { getByLabelText } = renderInput({ value: 'Hi' });
      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(false);
    });

    it('is disabled when global disabled is true', () => {
      const { getByLabelText } = renderInput({ value: 'Hi', disabled: true });
      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(true);
    });

    it('trims whitespace-only text and does not send', () => {
      const onSend = jest.fn();
      const { getByLabelText } = renderInput({ onSend, value: '   ' });

      fireEvent.press(getByLabelText('Send'));

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('mic button', () => {
    it('calls onMicPress when pressed', () => {
      const onMicPress = jest.fn();
      const { getByLabelText } = renderInput({ onMicPress });

      fireEvent.press(getByLabelText('Voice input'));

      expect(onMicPress).toHaveBeenCalledTimes(1);
    });

    it('shows recording state visually', () => {
      const { getByLabelText } = renderInput({ voiceState: 'recording' });

      const micButton = getByLabelText('Recording — tap to stop');
      expect(micButton).toBeTruthy();
    });

    it('shows stop icon when recording', () => {
      const { getByLabelText, UNSAFE_getAllByType } = renderInput({
        voiceState: 'recording',
      });
      const { Text } = require('react-native');

      expect(getByLabelText('Recording — tap to stop')).toBeTruthy();
      const texts = UNSAFE_getAllByType(Text);
      expect(
        texts.some((node: any) => node.props.children === '\u23F9'),
      ).toBe(true);
    });

    it('shows mic icon when idle', () => {
      const { getByLabelText, UNSAFE_getAllByType } = renderInput({
        voiceState: 'idle',
      });
      const { Text } = require('react-native');

      expect(getByLabelText('Voice input')).toBeTruthy();
      const texts = UNSAFE_getAllByType(Text);
      expect(
        texts.some((node: any) => node.props.children === '\uD83C\uDFA4'),
      ).toBe(true);
    });

    it('shows processing state', () => {
      const { getByLabelText } = renderInput({ voiceState: 'processing' });

      expect(getByLabelText('Processing speech…')).toBeTruthy();
    });

    it('shows error state', () => {
      const { getByLabelText } = renderInput({ voiceState: 'error' });

      expect(getByLabelText('Voice input error — tap to retry')).toBeTruthy();
    });

    it('is disabled when global disabled is true', () => {
      const { getByLabelText } = renderInput({ disabled: true });
      const micButton = getByLabelText('Voice input');
      expect(micButton.props.disabled).toBe(true);
    });
  });

  describe('placeholder text', () => {
    it('shows default placeholder when idle', () => {
      const { getByPlaceholderText } = renderInput({ voiceState: 'idle' });
      expect(
        getByPlaceholderText('Ask a follow-up question…'),
      ).toBeTruthy();
    });

    it('shows recording placeholder when recording', () => {
      const { getByPlaceholderText } = renderInput({ voiceState: 'recording' });
      expect(
        getByPlaceholderText('Recording… tap mic to stop'),
      ).toBeTruthy();
    });
  });

  describe('bilingual support', () => {
    it('uses English keys when language is en', () => {
      const { getByPlaceholderText, getByLabelText } = renderInput();
      expect(
        getByPlaceholderText('Ask a follow-up question…'),
      ).toBeTruthy();
      expect(getByLabelText('Voice input')).toBeTruthy();
    });

    it('renders all mic states with correct bilingual labels', () => {
      // Verify each voice state renders without crashes and has distinct labels
      const states: Array<{ voice: any; label: string }> = [
        { voice: 'idle', label: 'Voice input' },
        { voice: 'recording', label: 'Recording — tap to stop' },
        { voice: 'processing', label: 'Processing speech…' },
        { voice: 'error', label: 'Voice input error — tap to retry' },
      ];

      for (const { voice, label } of states) {
        const { getByLabelText } = renderInput({ voiceState: voice });
        expect(getByLabelText(label)).toBeTruthy();
      }
    });
  });

  describe('accessibility', () => {
    it('has accessibility label on mic button', () => {
      const { getByLabelText } = renderInput();
      expect(getByLabelText('Voice input')).toBeTruthy();
    });

    it('has accessibility label on send button', () => {
      const { getByLabelText } = renderInput();
      expect(getByLabelText('Send')).toBeTruthy();
    });

    it('has accessibility label on text input', () => {
      const { getByPlaceholderText } = renderInput();
      const input = getByPlaceholderText('Ask a follow-up question…');
      expect(input.props.accessibilityLabel).toBe(
        'Ask a follow-up question…',
      );
    });
  });

  describe('Platform behavior', () => {
    it('uses padding behavior on iOS', () => {
      jest.doMock('react-native', () => {
        const rn = jest.requireActual('react-native');
        return { ...rn, Platform: { OS: 'ios', ...rn.Platform } };
      });

      const { UNSAFE_getByType } = renderInput();
      const { KeyboardAvoidingView } = require('react-native');
      const kav = UNSAFE_getByType(KeyboardAvoidingView);
      expect(kav.props.behavior).toBe('padding');
    });
  });

  describe('disabled prop', () => {
    it('disables text input when disabled is true', () => {
      const { getByPlaceholderText } = renderInput({ disabled: true });
      const input = getByPlaceholderText('Ask a follow-up question…');
      expect(input.props.editable).toBe(false);
    });

    it('disables send button when disabled is true', () => {
      const { getByLabelText } = renderInput({ disabled: true, value: 'Hi' });
      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(true);
    });

    it('disables mic button when disabled is true', () => {
      const { getByLabelText } = renderInput({ disabled: true });
      const micButton = getByLabelText('Voice input');
      expect(micButton.props.disabled).toBe(true);
    });
  });
});
