import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import KidProfileScreen from '../KidProfileScreen';

const mockT = (k: string) => k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('KidProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(<KidProfileScreen />);
    expect(screen.getByText('onboarding.kidProfile.title')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<KidProfileScreen />);
    expect(screen.getByText('onboarding.kidProfile.subtitle')).toBeTruthy();
  });

  it('renders name input field', () => {
    render(<KidProfileScreen />);
    expect(screen.getByPlaceholderText('onboarding.kidProfile.namePlaceholder')).toBeTruthy();
  });

  it('renders all grade options P1-P6', () => {
    render(<KidProfileScreen />);
    ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].forEach((grade) => {
      expect(screen.getByText(grade)).toBeTruthy();
    });
  });

  it('renders all avatar options', () => {
    render(<KidProfileScreen />);
    const avatars = screen.getAllByLabelText('onboarding.kidProfile.accessibility.avatarOption');
    expect(avatars).toHaveLength(8);
  });

  it('renders continue button', () => {
    render(<KidProfileScreen />);
    expect(screen.getByText('onboarding.kidProfile.continue')).toBeTruthy();
  });

  it('continue button is disabled when form is incomplete', () => {
    render(<KidProfileScreen />);
    const btn = screen.getByText('onboarding.kidProfile.continue');
    expect(btn.parent?.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders skip button', () => {
    render(<KidProfileScreen />);
    expect(screen.getByText('onboarding.siblingPrompt.skip')).toBeTruthy();
  });

  it('fires onSkip when skip button pressed', () => {
    const onSkip = jest.fn();
    render(<KidProfileScreen onSkip={onSkip} />);
    fireEvent.press(screen.getByText('onboarding.siblingPrompt.skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('has accessibility header role on title', () => {
    render(<KidProfileScreen />);
    const title = screen.getByText('onboarding.kidProfile.title');
    expect(title.props.accessibilityRole).toBe('header');
  });
});
