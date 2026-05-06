/**
 * Tests for HintSection — hint display component.
 *
 * Covers:
 * - Renders hint text and heading
 * - Accessibility label includes hint text
 *
 * @see ADD §4.1 — Camera homework check flow (hint-first default)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HintSection from '../HintSection';

describe('HintSection', () => {
  it('renders heading and hint text', () => {
    render(
      <HintSection
        hint="Think about what 5 × 6 equals."
        headingLabel="Hint"
      />,
    );

    expect(screen.getByText('Hint')).toBeTruthy();
    expect(
      screen.getByText('Think about what 5 × 6 equals.'),
    ).toBeTruthy();
  });

  it('renders the lightbulb icon', () => {
    render(
      <HintSection hint="Try counting by fives." headingLabel="Hint" />,
    );

    expect(screen.getByText('💡')).toBeTruthy();
  });

  it('has accessibility label including hint text', () => {
    render(
      <HintSection
        hint="Break the problem into smaller parts."
        headingLabel="Hint"
      />,
    );

    expect(
      screen.getByLabelText('Hint: Break the problem into smaller parts.'),
    ).toBeTruthy();
  });
});
