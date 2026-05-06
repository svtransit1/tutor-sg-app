import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DoneScreen from '../../../app/(onboarding)/done';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => ['(onboarding)', 'done'],
  usePathname: () => '/(onboarding)/done',
}));

jest.mock('@/storage/onboarding', () => ({
  setOnboardingCompleted: jest.fn(),
  getOnboardingState: () => ({
    locale: 'en',
    grade: 'P3',
    subjects: ['math', 'english', 'chinese', 'science'],
    childProfiles: [{ grade: 'P3', subjects: ['math', 'english', 'chinese', 'science'] }],
    deviceTier: 'high',
    modelDownloaded: true,
  }),
}));

describe('DoneScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders without crash', () => {
    render(<DoneScreen />);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('displays done title via i18n key', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.title')).toBeTruthy();
  });

  it('displays done subtitle', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.subtitle')).toBeTruthy();
  });

  it('shows grade from mock profile data', () => {
    render(<DoneScreen />);
    expect(screen.getByText('P3')).toBeTruthy();
  });

  it('shows subject chips for all selected subjects', () => {
    render(<DoneScreen />);
    expect(screen.getAllByText('Math').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chinese').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Science').length).toBeGreaterThanOrEqual(1);
  });

  it('shows model download status', () => {
    render(<DoneScreen />);
    expect(screen.getByText('onboarding.done.modelDownloaded')).toBeTruthy();
  });

  it('renders Start Learning button with correct accessibility', () => {
    render(<DoneScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.done.startLearning' });
    expect(button).toBeTruthy();
  });

  it('marks onboarding complete and navigates to home on press', () => {
    const { setOnboardingCompleted } = require('@/storage/onboarding');
    render(<DoneScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.done.startLearning' });
    fireEvent.press(button);
    expect(setOnboardingCompleted).toHaveBeenCalledWith(true);
    expect(mockReplace).toHaveBeenCalledWith('/(kid)/home');
  });
});
