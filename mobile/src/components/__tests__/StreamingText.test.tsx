/**
 * Tests for StreamingText — typewriter animation.
 *
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import StreamingText from '../StreamingText';

jest.useFakeTimers();

describe('StreamingText', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders nothing when text is empty', () => {
    const { UNSAFE_root } = render(<StreamingText text="" />);
    expect(UNSAFE_root.children.length).toBe(0);
  });

  it('renders initial visible characters and progresses through text', () => {
    render(<StreamingText text="Hello" speed={100} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('calls onComplete when animation finishes', () => {
    const onComplete = jest.fn();
    render(<StreamingText text="A" speed={100} onComplete={onComplete} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows "Tutor is typing…" accessibility label while streaming', () => {
    render(<StreamingText text="Hello" speed={10} />);
    expect(screen.getByLabelText('Tutor is typing…')).toBeTruthy();
  });

  it('shows full text as accessibility label when animation completes', () => {
    render(<StreamingText text="Hi" speed={100} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByLabelText('Hi')).toBeTruthy();
  });

  it('includes accessibilityExtra when provided', () => {
    render(<StreamingText text="Hi" speed={100} accessibilityExtra="complete" />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByLabelText('Hi — complete')).toBeTruthy();
  });

  it('handles text change by resetting animation', () => {
    const { rerender } = render(<StreamingText text="Hello" speed={100} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('Hello')).toBeTruthy();
    rerender(<StreamingText text="World" speed={100} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('World')).toBeTruthy();
  });
});
