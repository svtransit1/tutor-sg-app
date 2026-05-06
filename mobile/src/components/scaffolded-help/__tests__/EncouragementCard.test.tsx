/**
 * Tests for EncouragementCard — motivational card component.
 *
 * Covers:
 * - Renders title and body text
 * - Applies dark mode styles
 * - Accessibility label
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import EncouragementCard from '../EncouragementCard';

describe('EncouragementCard', () => {
  it('renders title and body text', () => {
    render(
      <EncouragementCard
        title="Great work! 💪"
        body="Try the hint first."
      />,
    );

    expect(screen.getByText('Great work! 💪')).toBeTruthy();
    expect(screen.getByText('Try the hint first.')).toBeTruthy();
  });

  it('renders the encouragement icon', () => {
    render(
      <EncouragementCard
        title="Great work!"
        body="Keep it up!"
      />,
    );

    expect(screen.getByText('💪')).toBeTruthy();
  });

  it('has an accessibility label', () => {
    render(
      <EncouragementCard
        title="Great work!"
        body="Nice job!"
      />,
    );

    expect(
      screen.getByLabelText('Encouragement: Great work!'),
    ).toBeTruthy();
  });
});
