/**
 * Tests for ScaffoldedQuestion — hint-first AI response display.
 *
 * Covers:
 * - Renders question text, hint, and initial state
 * - "Show steps" button visible initially
 * - Pressing "Show steps" reveals steps and "Show full answer" button
 * - Pressing "Show full answer" reveals the solution
 * - Follow-up suggestion visible after steps revealed
 * - Topic label displayed when provided
 * - Subject colour applied to question number circle
 * - Accessibility labels
 * - Session logging callbacks (onRevealSteps, onRevealSolution)
 * - Backward navigation (go back to hint, go back to steps)
 *
 * @see ADD §4.1 — Camera homework check flow (hint-first default)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ScaffoldedQuestion from '../ScaffoldedQuestion';
import type { Step } from '../StepsSection';

// ── Fixtures ───────────────────────────────────────────────────────

const sampleSteps: Step[] = [
  { step: 1, description: 'Read the problem carefully.' },
  { step: 2, description: 'Identify what is being asked.', working: 'Find total apples' },
  { step: 3, description: 'Solve step by step.', working: '5 + 3 = 8' },
];

const defaultProps = {
  index: 1,
  questionText: 'If you have 5 apples and get 3 more, how many do you have?',
  hint: 'Think about what happens when you add more apples.',
  steps: sampleSteps,
  fullSolution: '5 + 3 = 8 apples.',
  labels: {
    question: 'Question 1',
    hint: 'Hint',
    showSteps: 'Show me the steps',
    steps: 'Step-by-step guide',
    showSolution: 'Show me the full answer',
    fullSolution: 'Full solution',
    tryThis: 'Try this next',
    goBackToHint: 'Back to hint',
    goBackToSteps: 'Back to steps',
    confirmSolutionTitle: 'See the answer?',
    confirmSolutionMessage: 'Are you sure you want to see the full solution? Try solving it yourself first!',
    confirmCancel: 'Not yet',
    confirmReveal: 'Show answer',
  },
};

// ── Tests ──────────────────────────────────────────────────────────

describe('ScaffoldedQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Initial State ───────────────────────────────────────

  it('renders question text and hint in initial state', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    expect(
      screen.getByText(
        'If you have 5 apples and get 3 more, how many do you have?',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Hint')).toBeTruthy();
    expect(
      screen.getByText('Think about what happens when you add more apples.'),
    ).toBeTruthy();
  });

  it('shows "Show me the steps" button initially', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    expect(screen.getByText('Show me the steps')).toBeTruthy();
  });

  it('does not show steps, solution, or follow-up initially', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    // Steps hidden
    expect(screen.queryByText('Read the problem carefully.')).toBeNull();
    // Solution hidden
    expect(screen.queryByText('Show me the full answer')).toBeNull();
    expect(screen.queryByText('5 + 3 = 8 apples.')).toBeNull();
    // Follow-up hidden
    expect(screen.queryByText('Try this next')).toBeNull();
  });

  // ── Reveal Steps ────────────────────────────────────────

  it('reveals steps and "Show full answer" button when "Show steps" is pressed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));

    // Steps visible
    expect(screen.getByText('Read the problem carefully.')).toBeTruthy();
    expect(screen.getByText('Step-by-step guide')).toBeTruthy();
    // Working text visible
    expect(screen.getByText('Find total apples')).toBeTruthy();
    expect(screen.getByText('5 + 3 = 8')).toBeTruthy();
    // "Show full answer" button appears
    expect(screen.getByText('Show me the full answer')).toBeTruthy();
    // Hint still visible
    expect(screen.getByText('Hint')).toBeTruthy();
  });

  it('hides "Show steps" button after steps are revealed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));

    expect(screen.queryByText('Show me the steps')).toBeNull();
  });

  // ── Inline Confirmation ─────────────────────────────────

  it('shows inline confirmation when "Show full answer" is pressed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    // First reveal steps
    fireEvent.press(screen.getByText('Show me the steps'));
    // Then press "Show full answer"
    fireEvent.press(screen.getByText('Show me the full answer'));

    // Confirmation dialog should be shown with title, message, and both buttons
    expect(screen.getByText('See the answer?')).toBeTruthy();
    expect(
      screen.getByText('Are you sure you want to see the full solution? Try solving it yourself first!'),
    ).toBeTruthy();
    expect(screen.getByText('Not yet')).toBeTruthy();
    expect(screen.getByText('Show answer')).toBeTruthy();
  });

  it('hides "Show full answer" button when confirmation is shown', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));

    // The "Show me the full answer" button should be replaced by the confirmation
    expect(screen.queryByText('Show me the full answer')).toBeNull();
  });

  it('cancelling confirmation returns to "Show full answer" button', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));

    // Now press "Not yet" to cancel
    fireEvent.press(screen.getByText('Not yet'));

    // "Show full answer" button returns
    expect(screen.getByText('Show me the full answer')).toBeTruthy();
    // Confirmation gone
    expect(screen.queryByText('See the answer?')).toBeNull();
  });

  it('reveals full solution after confirming the dialog', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    // First reveal steps
    fireEvent.press(screen.getByText('Show me the steps'));
    // Press "Show full answer" to show confirmation
    fireEvent.press(screen.getByText('Show me the full answer'));
    // Confirm by pressing "Show answer"
    fireEvent.press(screen.getByText('Show answer'));

    // Solution visible
    expect(screen.getByText('Full solution')).toBeTruthy();
    expect(screen.getByText('5 + 3 = 8 apples.')).toBeTruthy();
    // "Show full answer" button hidden
    expect(screen.queryByText('Show me the full answer')).toBeNull();
    // Confirmation hidden
    expect(screen.queryByText('See the answer?')).toBeNull();
    // Steps still visible
    expect(screen.getByText('Read the problem carefully.')).toBeTruthy();
  });

  // ── Follow-up Suggestion ────────────────────────────────

  it('shows follow-up suggestion only after steps are revealed', () => {
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        followUpSuggestion="Try with 10 apples instead."
      />,
    );

    // Follow-up hidden initially
    expect(screen.queryByText('Try this next')).toBeNull();
    expect(
      screen.queryByText('Try with 10 apples instead.'),
    ).toBeNull();

    // Reveal steps
    fireEvent.press(screen.getByText('Show me the steps'));

    // Follow-up visible
    expect(screen.getByText('Try this next')).toBeTruthy();
    expect(
      screen.getByText('Try with 10 apples instead.'),
    ).toBeTruthy();
  });

  // ── Topic Label ─────────────────────────────────────────

  it('renders topic label when provided', () => {
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        topic="Addition"
      />,
    );

    expect(screen.getByText('Addition')).toBeTruthy();
  });

  // ── Question Number ─────────────────────────────────────

  it('renders question number and label', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Question 1')).toBeTruthy();
  });

  // ── Accessibility ───────────────────────────────────────

  it('has accessibility label on the container', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    // accessibilityLabel is `${labels.question} ${index}` → "Question 1 1"
    expect(screen.getByLabelText('Question 1 1')).toBeTruthy();
  });

  it('has accessibility labels on reveal buttons', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    expect(
      screen.getByLabelText('Show me the steps'),
    ).toBeTruthy();
  });

  // ── Session Logging Callbacks ────────────────────────────

  it('calls onRevealSteps when steps are revealed', () => {
    const onRevealSteps = jest.fn();
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        onRevealSteps={onRevealSteps}
      />,
    );

    fireEvent.press(screen.getByText('Show me the steps'));
    expect(onRevealSteps).toHaveBeenCalledTimes(1);
  });

  it('calls onRevealSolution when solution is confirmed', () => {
    const onRevealSolution = jest.fn();
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        onRevealSolution={onRevealSolution}
      />,
    );

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));
    fireEvent.press(screen.getByText('Show answer'));
    expect(onRevealSolution).toHaveBeenCalledTimes(1);
  });

  it('does not call onRevealSolution when cancelled', () => {
    const onRevealSolution = jest.fn();
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        onRevealSolution={onRevealSolution}
      />,
    );

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));
    fireEvent.press(screen.getByText('Not yet'));
    expect(onRevealSolution).not.toHaveBeenCalled();
  });

  // ── Backward Navigation ──────────────────────────────────

  it('shows "Back to hint" link after steps are revealed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));

    expect(screen.getByText('← Back to hint')).toBeTruthy();
  });

  it('hides steps and returns to hint-only when "Back to hint" is pressed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    // Reveal steps first
    fireEvent.press(screen.getByText('Show me the steps'));
    expect(screen.getByText('Step-by-step guide')).toBeTruthy();

    // Go back to hint
    fireEvent.press(screen.getByText('← Back to hint'));

    // Steps hidden
    expect(screen.queryByText('Step-by-step guide')).toBeNull();
    // "Show steps" button returns
    expect(screen.getByText('Show me the steps')).toBeTruthy();
    // Hint still visible
    expect(screen.getByText('Hint')).toBeTruthy();
  });

  it('shows "Back to steps" link after solution is confirmed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));
    fireEvent.press(screen.getByText('Show answer'));

    expect(screen.getByText('← Back to steps')).toBeTruthy();
  });

  it('hides solution and returns to steps-only when "Back to steps" is pressed', () => {
    render(<ScaffoldedQuestion {...defaultProps} />);

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));
    fireEvent.press(screen.getByText('Show answer'));

    expect(screen.getByText('Full solution')).toBeTruthy();

    // Go back to steps
    fireEvent.press(screen.getByText('← Back to steps'));

    // Solution hidden
    expect(screen.queryByText('Full solution')).toBeNull();
    // "Show full answer" button returns
    expect(screen.getByText('Show me the full answer')).toBeTruthy();
    // Steps still visible
    expect(screen.getByText('Step-by-step guide')).toBeTruthy();
  });

  it('calls onGoBackToHint when kid goes back to hint', () => {
    const onGoBackToHint = jest.fn();
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        onGoBackToHint={onGoBackToHint}
      />,
    );

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('← Back to hint'));
    expect(onGoBackToHint).toHaveBeenCalledTimes(1);
  });

  it('calls onGoBackToSteps when kid goes back to steps', () => {
    const onGoBackToSteps = jest.fn();
    render(
      <ScaffoldedQuestion
        {...defaultProps}
        onGoBackToSteps={onGoBackToSteps}
      />,
    );

    fireEvent.press(screen.getByText('Show me the steps'));
    fireEvent.press(screen.getByText('Show me the full answer'));
    fireEvent.press(screen.getByText('Show answer'));
    fireEvent.press(screen.getByText('← Back to steps'));
    expect(onGoBackToSteps).toHaveBeenCalledTimes(1);
  });
});
