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
      };
      return keys[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

const defaultProps: FollowUpInputProps = {
  onSend: jest.fn(),
  onMicPress: jest.fn(),
  isRecording: false,
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
    it('accepts text input', () => {
      const { getByPlaceholderText } = renderInput();
      const input = getByPlaceholderText('Ask a follow-up question…');
      fireEvent.changeText(input, 'How do I solve this?');
      expect(input.props.value).toBe('How do I solve this?');
    });

    it('is disabled when recording', () => {
      const { getByPlaceholderText } = renderInput({ isRecording: true });
      const input = getByPlaceholderText('Recording… tap mic to stop');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('send button', () => {
    it('calls onSend with trimmed text', () => {
      const onSend = jest.fn();
      const { getByPlaceholderText, getByLabelText } = renderInput({ onSend });
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent.changeText(input, '  Help me!  ');
      fireEvent.press(getByLabelText('Send'));

      expect(onSend).toHaveBeenCalledWith('Help me!');
    });

    it('does not call onSend when text is empty', () => {
      const onSend = jest.fn();
      const { getByLabelText } = renderInput({ onSend });

      fireEvent.press(getByLabelText('Send'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('clears text after sending', () => {
      const onSend = jest.fn();
      const { getByPlaceholderText, getByLabelText } = renderInput({ onSend });
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent.changeText(input, 'Hello');
      fireEvent.press(getByLabelText('Send'));

      expect(input.props.value).toBe('');
    });

    it('calls onSend on submit editing', () => {
      const onSend = jest.fn();
      const { getByPlaceholderText } = renderInput({ onSend });
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent.changeText(input, 'Test question');
      fireEvent(input, 'submitEditing');

      expect(onSend).toHaveBeenCalledWith('Test question');
    });

    it('is disabled when text is empty', () => {
      const { getByLabelText } = renderInput();
      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(true);
    });

    it('is enabled when text is non-empty', () => {
      const { getByPlaceholderText, getByLabelText } = renderInput();
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent.changeText(input, 'Hi');

      const button = getByLabelText('Send');
      expect(button.props.disabled).toBe(false);
    });

    it('trims whitespace-only text and does not send', () => {
      const onSend = jest.fn();
      const { getByPlaceholderText, getByLabelText } = renderInput({ onSend });
      const input = getByPlaceholderText('Ask a follow-up question…');

      fireEvent.changeText(input, '   ');
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
      const { getByLabelText } = renderInput({ isRecording: true });

      const micButton = getByLabelText('Recording — tap to stop');
      expect(micButton).toBeTruthy();
    });

    it('shows stop icon when recording', () => {
      const { getByLabelText, UNSAFE_getAllByType } = renderInput({
        isRecording: true,
      });
      const { Text } = require('react-native');

      expect(getByLabelText('Recording — tap to stop')).toBeTruthy();
      const texts = UNSAFE_getAllByType(Text);
      expect(
        texts.some((node: any) => node.props.children === '⏹'),
      ).toBe(true);
    });

    it('shows mic icon when not recording', () => {
      const { getByLabelText, UNSAFE_getAllByType } = renderInput({
        isRecording: false,
      });
      const { Text } = require('react-native');

      expect(getByLabelText('Voice input')).toBeTruthy();
      const texts = UNSAFE_getAllByType(Text);
      expect(
        texts.some((node: any) => node.props.children === '🎤'),
      ).toBe(true);
    });
  });

  describe('placeholder text', () => {
    it('shows default placeholder when not recording', () => {
      const { getByPlaceholderText } = renderInput({ isRecording: false });
      expect(
        getByPlaceholderText('Ask a follow-up question…'),
      ).toBeTruthy();
    });

    it('shows recording placeholder when recording', () => {
      const { getByPlaceholderText } = renderInput({ isRecording: true });
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

    it('has all i18n keys defined in both EN and zh-Hans', () => {
      const en = require('../../../../shared/i18n/en/common.json');
      const zh = require('../../../../shared/i18n/zh-Hans/common.json');

      const enKeys = en?.homework?.followUp;
      const zhKeys = zh?.homework?.followUp;

      expect(enKeys).toBeDefined();
      expect(zhKeys).toBeDefined();

      expect(Object.keys(enKeys).sort()).toEqual(
        ['mic', 'micRecording', 'placeholder', 'placeholderRecording', 'send'],
      );
      expect(Object.keys(zhKeys).sort()).toEqual(
        Object.keys(enKeys).sort(),
      );
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
});
