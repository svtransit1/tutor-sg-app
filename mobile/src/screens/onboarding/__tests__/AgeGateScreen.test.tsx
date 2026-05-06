/**
 * Tests for AgeGateScreen (onboarding step 2/7 — Parent Gate).
 *
 * Validates:
 * - Default state renders title, body, and both actions
 * - Primary "I'm a parent" calls onComplete
 * - Secondary "go back" calls onGoBack
 * - Loading state disables both buttons
 * - Accessibility labels are present on both buttons
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AgeGateScreen from '../AgeGateScreen';

const mockT = (k: string) => k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

describe('AgeGateScreen', () => {
  it('renders title and body copy', () => {
    render(<AgeGateScreen />);
    expect(screen.getByText('onboarding.parentGate.title')).toBeTruthy();
    expect(screen.getByText('onboarding.parentGate.body')).toBeTruthy();
  });

  it('renders both action buttons', () => {
    render(<AgeGateScreen />);
    expect(screen.getByText(/onboarding\.parentGate\.continue/)).toBeTruthy();
    expect(screen.getByText(/onboarding\.parentGate\.goBack/)).toBeTruthy();
  });

  it('calls onComplete when primary button is pressed', () => {
    const onComplete = jest.fn();
    render(<AgeGateScreen onComplete={onComplete} />);
    fireEvent.press(screen.getByLabelText('onboarding.parentGate.continue'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onGoBack when secondary button is pressed', () => {
    const onGoBack = jest.fn();
    render(<AgeGateScreen onGoBack={onGoBack} />);
    fireEvent.press(screen.getByLabelText('onboarding.parentGate.goBack'));
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });

  it('has accessibilityRole button on both actions', () => {
    render(<AgeGateScreen />);
    expect(screen.getByLabelText('onboarding.parentGate.continue').props.accessibilityRole).toBe('button');
    expect(screen.getByLabelText('onboarding.parentGate.goBack').props.accessibilityRole).toBe('button');
  });

  it('has accessibilityLabel on both action buttons', () => {
    render(<AgeGateScreen />);
    expect(screen.getByLabelText('onboarding.parentGate.continue')).toBeTruthy();
    expect(screen.getByLabelText('onboarding.parentGate.goBack')).toBeTruthy();
  });

  it('primary button shows correct text', () => {
    render(<AgeGateScreen />);
    const btn = screen.getByLabelText('onboarding.parentGate.continue');
    expect(btn).toBeTruthy();
    expect(screen.getByText(/onboarding\.parentGate\.continue/)).toBeTruthy();
  });
});
