/**
 * Tests for StepsSection — step-by-step guide component.
 *
 * Covers:
 * - Renders heading and all steps
 * - Each step shows number in circle, description, and optional working
 * - Renders nothing when steps array is empty
 * - Accessibility label includes step count
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StepsSection from '../StepsSection';

describe('StepsSection', () => {
  const sampleSteps = [
    { step: 1, description: 'Count the apples.', working: '🍎🍎🍎' },
    { step: 2, description: 'Count the oranges.', working: '🍊🍊' },
    { step: 3, description: 'Add them together.', working: '3 + 2 = 5' },
  ];

  it('renders heading and all step descriptions', () => {
    render(
      <StepsSection
        steps={sampleSteps}
        headingLabel="Step-by-step guide"
      />,
    );

    expect(screen.getByText('Step-by-step guide')).toBeTruthy();
    expect(screen.getByText('Count the apples.')).toBeTruthy();
    expect(screen.getByText('Count the oranges.')).toBeTruthy();
    expect(screen.getByText('Add them together.')).toBeTruthy();
  });

  it('renders step numbers', () => {
    render(
      <StepsSection
        steps={sampleSteps}
        headingLabel="Steps"
      />,
    );

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders working text when provided', () => {
    render(
      <StepsSection
        steps={sampleSteps}
        headingLabel="Steps"
      />,
    );

    expect(screen.getByText('🍎🍎🍎')).toBeTruthy();
    expect(screen.getByText('🍊🍊')).toBeTruthy();
    expect(screen.getByText('3 + 2 = 5')).toBeTruthy();
  });

  it('renders nothing when steps array is empty', () => {
    const { UNSAFE_root } = render(
      <StepsSection steps={[]} headingLabel="Steps" />,
    );

    // Should not render anything
    expect(UNSAFE_root.children.length).toBe(0);
  });

  it('has accessibility label with step count', () => {
    render(
      <StepsSection
        steps={sampleSteps}
        headingLabel="Steps"
      />,
    );

    expect(
      screen.getByLabelText('Steps: 3 steps'),
    ).toBeTruthy();
  });
});
