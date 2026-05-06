import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FirstHomeworkScreen } from '../../onboarding/screens/FirstHomeworkScreen';

const mockGoNext = jest.fn();
jest.mock('../../onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    goNext: mockGoNext,
    state: { currentStep: 'first-homework' as const },
    isComplete: false,
  }),
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('FirstHomeworkScreen', () => {
  beforeEach(() => {
    mockGoNext.mockClear();
  });

  it('renders without crash', () => {
    render(<FirstHomeworkScreen />);
    expect(screen.getByText('Try your first homework!')).toBeTruthy();
  });

  it('displays the three steps', () => {
    render(<FirstHomeworkScreen />);
    expect(screen.getByText(/1\. Point your camera/)).toBeTruthy();
    expect(screen.getByText(/2\. Take a clear photo/)).toBeTruthy();
    expect(screen.getByText(/3\. Get hints/)).toBeTruthy();
  });

  it('renders CTA button', () => {
    render(<FirstHomeworkScreen />);
    expect(screen.getByTestId('firstHomework-start')).toBeTruthy();
    expect(screen.getByText("Let's go!")).toBeTruthy();
  });

  it('navigates next on CTA press', () => {
    render(<FirstHomeworkScreen />);
    fireEvent.press(screen.getByTestId('firstHomework-start'));
    expect(mockGoNext).toHaveBeenCalledTimes(1);
  });
});
