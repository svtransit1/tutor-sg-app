import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ModelDownloadScreen } from '../../onboarding/screens/ModelDownloadScreen';

const mockGoNext = jest.fn();
jest.mock('../../onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    goNext: mockGoNext,
    state: { currentStep: 'model-download' as const },
    isComplete: false,
  }),
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ModelDownloadScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows downloading state initially', () => {
    render(<ModelDownloadScreen />);
    expect(screen.getByText('Setting up your tutor...')).toBeTruthy();
    expect(screen.getByText('Downloading AI model...')).toBeTruthy();
  });

  it('shows progress percentage', () => {
    render(<ModelDownloadScreen />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('updates progress over time', () => {
    render(<ModelDownloadScreen />);
    jest.advanceTimersByTime(1000);
    expect(screen.getByText('25%')).toBeTruthy();
  });

  it('shows ready state when download completes', () => {
    render(<ModelDownloadScreen />);
    // 200ms per tick × 20 ticks = 4000ms to reach 100%
    jest.advanceTimersByTime(5000);
    expect(screen.getByText('Ready!')).toBeTruthy();
  });

  it('auto-advances to next step after completion', () => {
    render(<ModelDownloadScreen />);
    jest.advanceTimersByTime(5000);
    expect(mockGoNext).toHaveBeenCalled();
  });
});
