/**
 * Tests for TypingIndicator — thinking dots.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TypingIndicator from '../TypingIndicator';

describe('TypingIndicator', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders label when provided', () => {
    render(<TypingIndicator label="Thinking" />);
    expect(screen.getByText('Thinking')).toBeTruthy();
  });

  it('renders without crashing when no label', () => {
    const { UNSAFE_root } = render(<TypingIndicator />);
    expect(UNSAFE_root.children.length).toBeGreaterThan(0);
  });

  it('has accessibility label', () => {
    render(<TypingIndicator label="Thinking" />);
    expect(screen.getByLabelText('Thinking')).toBeTruthy();
  });

  it('falls back to default accessibility label', () => {
    render(<TypingIndicator />);
    expect(screen.getByLabelText('Tutor is thinking…')).toBeTruthy();
  });
});
