import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LangPickScreen from '../LangPickScreen';

const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockRouterReplace, push: jest.fn() }),
}));

const mockChangeLanguage = jest.fn();
const mockT = jest.fn((key: string) => {
  if (key === 'onboarding.langPick.title') return 'Choose your language';
  if (key === 'onboarding.langPick.english') return 'English';
  if (key === 'onboarding.langPick.englishSub') return '英文';
  if (key === 'onboarding.langPick.chinese') return '中文 (简体)';
  if (key === 'onboarding.langPick.chineseSub') return 'Chinese (Simplified)';
  return key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en', changeLanguage: mockChangeLanguage },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

const mockPersistLocale = jest.fn();
jest.mock('../../../storage/onboarding-state', () => ({
  persistLocale: (...args: unknown[]) => mockPersistLocale(...args),
}));

describe('LangPickScreen — Onboarding Step 1/7', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title from i18n', () => {
    render(<LangPickScreen />);
    expect(screen.getByText('Choose your language')).toBeTruthy();
  });

  it('renders the English tile with bilingual labels', () => {
    render(<LangPickScreen />);
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('英文')).toBeTruthy();
  });

  it('renders the Chinese tile with bilingual labels', () => {
    render(<LangPickScreen />);
    expect(screen.getByText('中文 (简体)')).toBeTruthy();
    expect(screen.getByText('Chinese (Simplified)')).toBeTruthy();
  });

  it('renders both flag emojis', () => {
    render(<LangPickScreen />);
    expect(screen.getByText('🇬🇧')).toBeTruthy();
    expect(screen.getByText('🇨🇳')).toBeTruthy();
  });

  it('does NOT render a Continue button', () => {
    render(<LangPickScreen />);
    const buttons = screen.queryAllByText('Continue');
    expect(buttons).toHaveLength(0);
  });

  it('does NOT render any progress indicator', () => {
    render(<LangPickScreen />);
    const progressStep = screen.queryByText(/step/i);
    expect(progressStep).toBeNull();
  });

  it('title has accessibility role header', () => {
    render(<LangPickScreen />);
    const headers = screen.getAllByRole('header');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('persists locale and navigates to age-gate when English tile is tapped', () => {
    render(<LangPickScreen />);
    const englishTile = screen.getByLabelText('English — 英文');
    fireEvent.press(englishTile);
    expect(mockPersistLocale).toHaveBeenCalledWith('en');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    expect(mockRouterReplace).toHaveBeenCalledWith('/(onboarding)/age-gate');
  });

  it('persists locale and navigates to age-gate when Chinese tile is tapped', () => {
    render(<LangPickScreen />);
    const chineseTile = screen.getByLabelText('中文 (简体) — Chinese (Simplified)');
    fireEvent.press(chineseTile);
    expect(mockPersistLocale).toHaveBeenCalledWith('zh-Hans');
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh-Hans');
    expect(mockRouterReplace).toHaveBeenCalledWith('/(onboarding)/age-gate');
  });

  it('calls persist + navigate exactly once per tap', () => {
    render(<LangPickScreen />);
    const englishTile = screen.getByLabelText('English — 英文');
    fireEvent.press(englishTile);
    expect(mockPersistLocale).toHaveBeenCalledTimes(1);
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    expect(mockRouterReplace).toHaveBeenCalledTimes(1);
  });

  it('has accessibilityRole button on English tile', () => {
    render(<LangPickScreen />);
    const tile = screen.getByLabelText('English — 英文');
    expect(tile.props.accessibilityRole).toBe('button');
  });

  it('has accessibilityRole button on Chinese tile', () => {
    render(<LangPickScreen />);
    const tile = screen.getByLabelText('中文 (简体) — Chinese (Simplified)');
    expect(tile.props.accessibilityRole).toBe('button');
  });

  it('has accessibilityLabel on English tile', () => {
    render(<LangPickScreen />);
    const tile = screen.getByLabelText('English — 英文');
    expect(tile).toBeTruthy();
  });

  it('has accessibilityLabel on Chinese tile', () => {
    render(<LangPickScreen />);
    const tile = screen.getByLabelText('中文 (简体) — Chinese (Simplified)');
    expect(tile).toBeTruthy();
  });
});
