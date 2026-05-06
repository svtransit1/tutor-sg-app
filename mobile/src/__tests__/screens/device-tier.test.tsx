import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DeviceTierScreen } from '../../onboarding/screens/DeviceTierScreen';

const mockGoNext = jest.fn();
const mockGoBack = jest.fn();
const mockUpdateProgress = jest.fn();

jest.mock('../../onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    goNext: mockGoNext,
    goBack: mockGoBack,
    updateProgress: mockUpdateProgress,
    state: { currentStep: 'device-tier' as const },
    canGoBack: true,
    isComplete: false,
  }),
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DeviceTierScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows checking state initially', () => {
    render(<DeviceTierScreen />);
    expect(screen.getByText('Checking your device...')).toBeTruthy();
  });

  it('shows success state after check completes', () => {
    render(<DeviceTierScreen />);
    jest.advanceTimersByTime(2000);
    expect(screen.getByText('Device Ready!')).toBeTruthy();
  });

  it('shows continue button after check', () => {
    render(<DeviceTierScreen />);
    jest.advanceTimersByTime(2000);
    expect(screen.getByTestId('deviceTier-continue')).toBeTruthy();
  });

  it('navigates next on continue press', () => {
    render(<DeviceTierScreen />);
    jest.advanceTimersByTime(2000);
    fireEvent.press(screen.getByTestId('deviceTier-continue'));
    expect(mockGoNext).toHaveBeenCalledTimes(1);
  });

  it('navigates back on back press', () => {
    render(<DeviceTierScreen />);
    jest.advanceTimersByTime(2000);
    fireEvent.press(screen.getByTestId('deviceTier-back'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
