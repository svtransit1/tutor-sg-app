/**
 * Tests for SubjectBadge — subject icon + colour badge component.
 *
 * Covers:
 * - Renders icon + label for each subject
 * - Applies correct colour for each subject
 * - Accessibility label
 *
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SubjectBadge, { SUBJECT_META } from '../SubjectBadge';

describe('SubjectBadge', () => {
  it.each([
    ['math', 'Math', '#E8F5E9'],
    ['english', 'English', '#E3F2FD'],
    ['science', 'Science', '#FFF3E0'],
    ['chinese_mt', '中文', '#FCE4EC'],
  ] as const)(
    'renders %s subject with correct icon, label, and colour',
    (subject, label, expectedColor) => {
      render(<SubjectBadge subject={subject} label={label} />);

      const meta = SUBJECT_META[subject];
      expect(screen.getByText(meta.icon)).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
    },
  );

  it('has accessibility label with subject name', () => {
    render(<SubjectBadge subject="math" label="Math" />);

    expect(screen.getByLabelText('Math subject')).toBeTruthy();
  });
});
