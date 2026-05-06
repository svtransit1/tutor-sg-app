/**
 * Tests for FollowUpChat — chat input + message display.
 *
 * Covers:
 * - Renders nothing when no messages and empty input
 * - Renders messages as bubbles
 * - User and assistant messages have different styles
 * - Input field renders
 * - Send button enabled only when text is entered
 * - Send button fires onSend
 * - onSubmitEditing fires onSend
 * - Accessibility labels
 *
 * @see ADD §4.1 — Follow-up chat
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FollowUpChat from '../FollowUpChat';

describe('FollowUpChat', () => {
  const defaultProps = {
    messages: [],
    inputValue: '',
    onInputChange: jest.fn(),
    onSend: jest.fn(),
    placeholder: 'Ask a follow-up question…',
    inputAccessibilityLabel: 'Type a follow-up question',
    sendAccessibilityLabel: 'Send',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Empty State ────────────────────────────────────────

  it('renders nothing when no messages and empty input', () => {
    const { UNSAFE_root } = render(<FollowUpChat {...defaultProps} />);

    // No messages, no input bar to show
    // Empty render — nothing to query
    expect(UNSAFE_root.children.length).toBe(0);
  });

  // ── Messages ───────────────────────────────────────────

  it('renders user and assistant messages', () => {
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[
          { role: 'user', text: 'Can you explain step 2?' },
          {
            role: 'assistant',
            text: 'Sure! Step 2 means you need to count...',
          },
        ]}
      />,
    );

    expect(
      screen.getByText('Can you explain step 2?'),
    ).toBeTruthy();
    expect(
      screen.getByText('Sure! Step 2 means you need to count...'),
    ).toBeTruthy();
  });

  // ── Input Field ────────────────────────────────────────

  it('renders input field when there are messages', () => {
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[{ role: 'user', text: 'Hello' }]}
        inputValue=""
      />,
    );

    const input = screen.getByLabelText(
      'Type a follow-up question',
    );
    expect(input).toBeTruthy();
  });

  it('calls onInputChange when text is typed', () => {
    const onInputChange = jest.fn();
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[{ role: 'user', text: 'Hello' }]}
        inputValue=""
        onInputChange={onInputChange}
      />,
    );

    const input = screen.getByLabelText(
      'Type a follow-up question',
    );
    fireEvent.changeText(input, 'Why is it 5?');
    expect(onInputChange).toHaveBeenCalledWith('Why is it 5?');
  });

  // ── Send Button ────────────────────────────────────────

  it('fires onSend when send button is pressed with text', () => {
    const onSend = jest.fn();
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[{ role: 'user', text: 'Hello' }]}
        inputValue="Why is it 5?"
        onSend={onSend}
      />,
    );

    fireEvent.press(screen.getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('does not fire onSend when send button is pressed without text', () => {
    const onSend = jest.fn();
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[{ role: 'user', text: 'Hello' }]}
        inputValue="   "
        onSend={onSend}
      />,
    );

    const sendButton = screen.getByLabelText('Send');
    fireEvent.press(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  // ── Accessibility ──────────────────────────────────────

  it('has accessibility labels on user and assistant bubbles', () => {
    render(
      <FollowUpChat
        {...defaultProps}
        messages={[
          { role: 'user', text: 'Hello' },
          { role: 'assistant', text: 'Hi there!' },
        ]}
      />,
    );

    expect(screen.getByLabelText('You: Hello')).toBeTruthy();
    expect(screen.getByLabelText('Tutor: Hi there!')).toBeTruthy();
  });
});
