import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock expo-router before importing the component
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const MockLink = (props: any) => {
    const { children } = props;
    return children;
  };
  return {
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: () => true,
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => ['(onboarding)', 'welcome'],
    usePathname: () => '/(onboarding)/welcome',
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useFocusEffect: jest.fn(),
    Stack: () => null,
    Tabs: () => null,
    router: { push: mockPush, replace: jest.fn(), back: jest.fn() },
    Link: MockLink,
    Redirect: () => null,
  };
});

import WelcomeScreen from '../../../app/(onboarding)/welcome';

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
    expect(screen.getByText('onboarding.welcome.title')).toBeTruthy();
  });

  it('displays welcome tagline via i18n key', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('onboarding.welcome.tagline')).toBeTruthy();
  });

  it('displays welcome subtitle via i18n key', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('onboarding.welcome.subtitle')).toBeTruthy();
  });

  it('renders Get Started button with correct accessibility', () => {
    render(<WelcomeScreen />);
    // Use accessibilityLabel to find the button (RNTL role query requires
    // real RN components, not string mocks)
    const button = screen.getByLabelText('onboarding.welcome.cta');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('onboarding.welcome.cta');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('navigates to consent screen when Get Started is pressed', () => {
    render(<WelcomeScreen />);
    const button = screen.getByLabelText('onboarding.welcome.cta');
    fireEvent.press(button);
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/consent');
  });

  it('displays the app logo with accessibility role', () => {
    render(<WelcomeScreen />);
    const logo = screen.getByLabelText('tutor-sg');
    expect(logo).toBeTruthy();
    expect(logo.props.accessibilityRole).toBe('image');
  });
});
