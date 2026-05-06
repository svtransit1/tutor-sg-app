/**
 * Tests for TutorChatScreen — full-screen tutor chat.
 *
 * @see ADD §4.1 — Follow-up chat
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import TutorChatScreen from '../TutorChatScreen';
import type { ChatMessage } from '../TutorChatScreen';

// ── Fixtures ──

const mockOnSend = jest.fn().mockResolvedValue({
  id: 'resp_1',
  role: 'assistant',
  text: 'Great question! Let me help you with that.',
  streaming: false,
} as ChatMessage);

const mockScaffoldedOnSend = jest.fn().mockResolvedValue({
  id: 'resp_2',
  role: 'assistant',
  text: "Let's work on this together!",
  streaming: false,
  scaffoldedHelp: {
    hint: 'Read the question carefully.',
    steps: [{ step: 1, description: 'Identify the key numbers.' }],
    fullSolution: 'The answer is 8.',
  },
} as ChatMessage);

const sampleMessages: ChatMessage[] = [
  { id: 'm1', role: 'user', text: 'Can you help with math?' },
  { id: 'm2', role: 'assistant', text: 'Sure! What math problem?', streaming: false },
];

// ── Tests ──

describe('TutorChatScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders header with title', () => {
    render(<TutorChatScreen initialMessages={[]} onSendMessage={mockOnSend} />);
    expect(screen.getByText('tutorChat.title')).toBeTruthy();
  });

  it('shows empty state when no messages', () => {
    render(<TutorChatScreen initialMessages={[]} onSendMessage={mockOnSend} />);
    expect(screen.getByText('tutorChat.emptyState.title')).toBeTruthy();
    expect(screen.getByText('tutorChat.emptyState.body')).toBeTruthy();
  });

  it('renders suggestion chips on empty state', () => {
    render(<TutorChatScreen initialMessages={[]} onSendMessage={mockOnSend} />);
    expect(screen.getByText('tutorChat.suggestion.math')).toBeTruthy();
  });

  it('renders message bubbles', () => {
    render(<TutorChatScreen initialMessages={sampleMessages} onSendMessage={mockOnSend} />);
    expect(screen.getByText('Can you help with math?')).toBeTruthy();
    expect(screen.getByText('Sure! What math problem?')).toBeTruthy();
  });

  it('does not show empty state when there are messages', () => {
    render(<TutorChatScreen initialMessages={sampleMessages} onSendMessage={mockOnSend} />);
    expect(screen.queryByText('tutorChat.emptyState.title')).toBeNull();
  });

  it('renders input field', () => {
    render(<TutorChatScreen initialMessages={sampleMessages} onSendMessage={mockOnSend} />);
    expect(screen.getByLabelText('tutorChat.inputAccessibility')).toBeTruthy();
  });

  it('sends message when send button is pressed', async () => {
    render(<TutorChatScreen initialMessages={[]} onSendMessage={mockOnSend} />);
    const input = screen.getByLabelText('tutorChat.inputAccessibility');
    fireEvent.changeText(input, 'What is 2+2?');
    fireEvent.press(screen.getByLabelText('tutorChat.send'));
    expect(mockOnSend).toHaveBeenCalledWith('What is 2+2?');
    await waitFor(() => {
      expect(screen.getByText('Great question! Let me help you with that.')).toBeTruthy();
    });
  });

  it('renders scaffolded help hint card', async () => {
    render(<TutorChatScreen initialMessages={[]} onSendMessage={mockScaffoldedOnSend} />);
    const input = screen.getByLabelText('tutorChat.inputAccessibility');
    fireEvent.changeText(input, 'Math question');
    fireEvent.press(screen.getByLabelText('tutorChat.send'));
    await waitFor(() => {
      expect(screen.getByText('tutorChat.hint')).toBeTruthy();
      expect(screen.getByText('Read the question carefully.')).toBeTruthy();
    });
  });

  it('has accessibility labels on user bubbles', () => {
    render(<TutorChatScreen initialMessages={sampleMessages} onSendMessage={mockOnSend} />);
    expect(screen.getByLabelText('You: Can you help with math?')).toBeTruthy();
  });

  it('has accessibility label on send button', () => {
    render(<TutorChatScreen initialMessages={sampleMessages} onSendMessage={mockOnSend} />);
    expect(screen.getByLabelText('tutorChat.send')).toBeTruthy();
  });
});
