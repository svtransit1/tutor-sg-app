/**
 * Tests for OnboardingProgressIndicator component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import OnboardingProgressIndicator from '../OnboardingProgressIndicator';

// Mock react-i18next useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const m: Record<string, string> = {
        'onboarding.progress.step': `Step ${params?.current} of ${params?.total}`,
        'onboarding.progress.accessibility': `Step ${params?.current} of ${params?.total}`,
      };
      return m[key] ?? key;
    },
  }),
}));

describe('OnboardingProgressIndicator', () => {
  it('renders correct step text for step 2 of 7', () => {
    render(<OnboardingProgressIndicator currentStep={2} totalSteps={7} />);
    expect(screen.getByText('Step 2 of 7')).toBeTruthy();
  });

  it('renders correct text for step 1 of 7', () => {
    render(<OnboardingProgressIndicator currentStep={1} totalSteps={7} />);
    expect(screen.getByText('Step 1 of 7')).toBeTruthy();
  });

  it('renders correct text for step 7 of 7', () => {
    render(<OnboardingProgressIndicator currentStep={7} totalSteps={7} />);
    expect(screen.getByText('Step 7 of 7')).toBeTruthy();
  });

  it('renders without crash for all step values', () => {
    const { rerender } = render(<OnboardingProgressIndicator currentStep={1} totalSteps={7} />);
    expect(screen.getByText('Step 1 of 7')).toBeTruthy();

    rerender(<OnboardingProgressIndicator currentStep={5} totalSteps={7} />);
    expect(screen.getByText('Step 5 of 7')).toBeTruthy();
  });
});
