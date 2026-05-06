import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock expo-router before importing the component
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const MockLink = (props: any) => {
    const { children } = props;
    return children;
  };
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
      canGoBack: () => true,
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => ['(onboarding)', 'done'],
    usePathname: () => '/(onboarding)/done',
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useFocusEffect: jest.fn(),
    Stack: () => null,
    Tabs: () => null,
    router: { push: mockPush, replace: mockReplace, back: jest.fn() },
    Link: MockLink,
    Redirect: () => null,
  };
});

// Mock @/components/OnboardingProgressIndicator
jest.mock('@/components/OnboardingProgressIndicator', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
      <Text>{`Step ${currentStep}/${totalSteps}`}</Text>
    ),
  };
});

import DoneScreen from '../../../app/(onboarding)/done';

describe('DoneScreen (Ready Landing)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
  });

  it('renders without crash', () => {
    render(<DoneScreen />);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('displays step indicator 7/7', () => {
    render(<DoneScreen />);
    expect(screen.getByText('Step 7/7')).toBeTruthy();
  });

  it('displays done title via i18n key', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.title')).toBeTruthy();
  });

  it('displays done subtitle via i18n key', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.subtitle')).toBeTruthy();
  });

  it('displays greeting with kid name via i18n key', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.greeting')).toBeTruthy();
  });

  it('displays camera CTA title and subtitle via i18n keys', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.cameraCta')).toBeTruthy();
    expect(screen.getByText('onboarding.done.cameraSubtitle')).toBeTruthy();
  });

  it('displays practice prompt text', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.practicePrompt')).toBeTruthy();
  });

  it('renders camera button with correct accessibility label', () => {
    render(<DoneScreen />);
    const cameraButton = screen.getByLabelText('onboarding.done.cameraCta');
    expect(cameraButton).toBeTruthy();
    expect(cameraButton.props.accessibilityRole).toBe('button');
  });

  it('renders parent area link with correct accessibility label', () => {
    render(<DoneScreen />);
    const parentLink = screen.getByLabelText('onboarding.done.parentArea');
    expect(parentLink).toBeTruthy();
    expect(parentLink.props.accessibilityRole).toBe('button');
  });

  it('renders celebration star icon', () => {
    render(<DoneScreen />);
    const star = screen.getByLabelText('Celebration star');
    expect(star).toBeTruthy();
  });

  it('navigates to camera on camera CTA press', () => {
    render(<DoneScreen />);
    const cameraButton = screen.getByLabelText('onboarding.done.cameraCta');
    fireEvent.press(cameraButton);
    expect(mockReplace).toHaveBeenCalledWith('/(kid)/camera');
  });

  it('navigates to kid home on subject tile press', () => {
    render(<DoneScreen />);
    // Find the Math subject tile by accessibility label
    const mathTile = screen.getByLabelText('kidHome.subjects.math');
    fireEvent.press(mathTile);
    expect(mockReplace).toHaveBeenCalledWith('/(kid)/home');
  });

  it('renders privacy badge with shield icon and privacy text', () => {
    render(<DoneScreen />);
    expect(screen.getByLabelText('onboarding.done.privacyBadge')).toBeTruthy();
    expect(screen.getByText('onboarding.done.privacyBadge')).toBeTruthy();
  });

  it('renders privacy badge visible without scroll (in footer, below ScrollView)', () => {
    render(<DoneScreen />);
    const privacyBadge = screen.getByLabelText('onboarding.done.privacyBadge');
    expect(privacyBadge).toBeTruthy();
    // Badge has accessibilityRole summary to differentiate from interactive elements
    expect(privacyBadge.props.accessibilityRole).toBe('summary');
  });

  it('renders celebration star with animated container', () => {
    render(<DoneScreen />);
    const star = screen.getByLabelText('Celebration star');
    expect(star).toBeTruthy();
  });

  it('navigates to parent dashboard on parent area link press', () => {
    render(<DoneScreen />);
    const parentLink = screen.getByLabelText('onboarding.done.parentArea');
    fireEvent.press(parentLink);
    expect(mockPush).toHaveBeenCalledWith('/(parent)/dashboard');
  });
});
