import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../../../app/(onboarding)/welcome';

// Mock expo-router before importing the component
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => ['(onboarding)', 'welcome'],
  usePathname: () => '/(onboarding)/welcome',
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders without crash', () => {
    render(<WelcomeScreen />);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('displays welcome title via i18n key', () => {
    render(<WelcomeScreen />);
    // i18n mock returns the key itself
    expect(screen.getByText('onboarding.welcome')).toBeTruthy();
  });

  it('displays welcome subtitle', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('onboarding.welcomeSubtitle')).toBeTruthy();
  });

  it('renders Get Started button with correct accessibility', () => {
    render(<WelcomeScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.getStarted' });
    expect(button).toBeTruthy();
  });

  it('navigates to consent screen when Get Started is pressed', () => {
    render(<WelcomeScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.getStarted' });
    fireEvent.press(button);
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/consent');
  });
});
