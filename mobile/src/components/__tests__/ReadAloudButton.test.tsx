import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ReadAloudButton from '../ReadAloudButton';
import { speak, stop } from 'expo-speech';

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'homeworkFeedback.speakContent': 'Read aloud',
    'homeworkFeedback.stopSpeaking': 'Stop',
    'homeworkFeedback.accessibility.speakContent': 'Read the explanation aloud',
    'homeworkFeedback.accessibility.stopSpeaking': 'Stop reading',
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

const BTN_TEST_ID = 'ReadAloudButton';

describe('ReadAloudButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders idle state by default', () => {
    render(<ReadAloudButton text="Test content" />);
    expect(screen.getByText('Read aloud')).toBeTruthy();
    expect(screen.getByText('🔊')).toBeTruthy();
  });

  it('renders with correct accessibility label in idle state', () => {
    render(<ReadAloudButton text="Test content" />);
    expect(
      screen.getByTestId(BTN_TEST_ID).props.accessibilityLabel,
    ).toBe('Read the explanation aloud');
  });

  it('calls Speech.speak with English language on press', () => {
    render(<ReadAloudButton text="Hello, here is the answer." />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).toHaveBeenCalledWith(
      'Hello, here is the answer.',
      expect.objectContaining({ language: 'en-US' }),
    );
  });

  it('calls Speech.speak with Chinese language when text contains CJK characters', () => {
    render(
      <ReadAloudButton text="答案是：先计算这两个数字的和。" />,
    );
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).toHaveBeenCalledWith(
      '答案是：先计算这两个数字的和。',
      expect.objectContaining({ language: 'zh-CN' }),
    );
  });

  it('shows speaking state and stop label after speaking starts', () => {
    render(<ReadAloudButton text="Test content" />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(screen.getByText('Stop')).toBeTruthy();
    expect(screen.getByText('🔉')).toBeTruthy();
    expect(
      screen.getByTestId(BTN_TEST_ID).props.accessibilityLabel,
    ).toBe('Stop reading');
  });

  it('stops speaking and returns to idle on second press', () => {
    render(<ReadAloudButton text="Test content" />);

    fireEvent.press(screen.getByTestId(BTN_TEST_ID));
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(stop).toHaveBeenCalled();
    expect(screen.getByText('Read aloud')).toBeTruthy();
    expect(screen.getByText('🔊')).toBeTruthy();
  });

  it('uses explicit language prop over auto-detection', () => {
    render(
      <ReadAloudButton
        text="你好 world"
        language="en-US"
      />,
    );
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).toHaveBeenCalledWith(
      '你好 world',
      expect.objectContaining({ language: 'en-US' }),
    );
  });

  it('uses custom rate when provided', () => {
    render(<ReadAloudButton text="Test content" rate={0.75} />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).toHaveBeenCalledWith(
      'Test content',
      expect.objectContaining({ rate: 0.75 }),
    );
  });

  it('does not respond when disabled', () => {
    render(<ReadAloudButton text="Test content" disabled />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).not.toHaveBeenCalled();
  });

  it('does not respond when text is empty', () => {
    render(<ReadAloudButton text="" />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    expect(speak).not.toHaveBeenCalled();
  });

  it('calls onStateChange for state transitions', () => {
    const onStateChange = jest.fn();
    render(
      <ReadAloudButton
        text="Test content"
        onStateChange={onStateChange}
      />,
    );

    fireEvent.press(screen.getByTestId(BTN_TEST_ID));
    expect(onStateChange).toHaveBeenCalledWith('speaking');
  });

  it('calls onDone when speech completes', () => {
    const onDone = jest.fn();
    render(<ReadAloudButton text="Test content" onDone={onDone} />);

    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    const speakCallArgs = (speak as jest.Mock).mock.calls[0][1];
    speakCallArgs.onDone();

    expect(onDone).toHaveBeenCalled();
    expect(screen.getByText('Read aloud')).toBeTruthy();
  });

  it('calls onError when speech fails', () => {
    const onError = jest.fn();
    render(<ReadAloudButton text="Test content" onError={onError} />);

    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    const speakCallArgs = (speak as jest.Mock).mock.calls[0][1];
    speakCallArgs.onError(new Error('Speech failed'));

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Speech failed' }),
    );
    expect(screen.getByText('Read aloud')).toBeTruthy();
  });

  it('returns to idle when speech is stopped externally', () => {
    render(<ReadAloudButton text="Test content" />);

    fireEvent.press(screen.getByTestId(BTN_TEST_ID));

    const speakCallArgs = (speak as jest.Mock).mock.calls[0][1];
    speakCallArgs.onStopped();

    expect(screen.getByText('Read aloud')).toBeTruthy();
  });

  it('stops speech on unmount (back nav / swipe / tab switch)', () => {
    const { unmount } = render(<ReadAloudButton text="Test content" />);
    fireEvent.press(screen.getByTestId(BTN_TEST_ID));
    expect(speak).toHaveBeenCalled();

    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it('handles unmount even in idle state without throwing', () => {
    const { unmount } = render(<ReadAloudButton text="Test content" />);
    expect(() => unmount()).not.toThrow();
  });

  it('accepts a custom style prop', () => {
    render(
      <ReadAloudButton text="Test content" style={{ marginTop: 8 }} />,
    );
    expect(screen.getByText('🔊')).toBeTruthy();
  });
});
