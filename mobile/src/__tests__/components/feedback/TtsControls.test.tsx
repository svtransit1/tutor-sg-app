import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import TtsControls from '../../../components/feedback/TtsControls';

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
  getAvailableVoicesAsync: async () => [],
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

describe('TtsControls', () => {
  it('renders a play button in idle state', () => {
    render(<TtsControls text="Hello world" language="en" />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('displays the label when provided', () => {
    render(<TtsControls text="Hello" language="en" label="tts.feedbackSolution" />);
    expect(screen.getByText('tts.feedbackSolution')).toBeTruthy();
  });

  it('speaks on press when idle', () => {
    render(<TtsControls text="Read this aloud" language="en" />);
    fireEvent.press(screen.getByRole('button'));
    expect(mockSpeech.$text()).toBe('Read this aloud');
  });

  it('speaks Simplified Chinese text', () => {
    render(<TtsControls text="你好" language="zh-Hans" />);
    fireEvent.press(screen.getByRole('button'));
    expect(mockSpeech.$text()).toBe('你好');
  });

  it('shows stop button while speaking', () => {
    render(<TtsControls text="Test" language="en" />);
    fireEvent.press(screen.getByRole('button'));
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  it('stops on stop button press', async () => {
    render(<TtsControls text="Test" language="en" />);
    fireEvent.press(screen.getByRole('button'));
    const stopButton = screen.getAllByRole('button').at(-1)!;
    await act(async () => {
      fireEvent.press(stopButton);
    });
    expect(mockSpeech.$text()).toBe('');
  });

  it('fires onDone when speech completes', () => {
    const onDone = jest.fn();
    render(<TtsControls text="Test" language="en" onDone={onDone} />);
    fireEvent.press(screen.getByRole('button'));
    act(() => {
      mockSpeech.$done();
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('shows error text on speech error', () => {
    render(<TtsControls text="Test" language="en" />);
    fireEvent.press(screen.getByRole('button'));
    act(() => {
      mockSpeech.$fail(new Error('fail'));
    });
    expect(screen.getAllByText('tts.error').length).toBeGreaterThanOrEqual(1);
  });

  it('has accessibilityRole="button" and accessibilityLabel on the play button', () => {
    render(<TtsControls text="Test" language="en" />);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBeDefined();
  });
});
