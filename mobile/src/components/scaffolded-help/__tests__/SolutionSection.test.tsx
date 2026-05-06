/**
 * Tests for SolutionSection — full solution display component.
 *
 * Covers:
 * - Renders heading and solution text
 * - Renders checkmark icon
 * - Accessibility label
 *
 * @see ADD §4.1 — Camera homework check flow (full answer only on demand)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SolutionSection from '../SolutionSection';

describe('SolutionSection', () => {
  it('renders heading and solution text', () => {
    render(
      <SolutionSection
        solution="The answer is 42."
        headingLabel="Full solution"
      />,
    );

    expect(screen.getByText('Full solution')).toBeTruthy();
    expect(screen.getByText('The answer is 42.')).toBeTruthy();
  });

  it('renders the checkmark icon', () => {
    render(
      <SolutionSection
        solution="x = 5"
        headingLabel="Full solution"
      />,
    );

    expect(screen.getByText('✅')).toBeTruthy();
  });

  it('has accessibility label', () => {
    render(
      <SolutionSection
        solution="Step 1: ..."
        headingLabel="Full solution"
      />,
    );

    expect(screen.getByLabelText('Full solution')).toBeTruthy();
  });
});
