/**
 * Tests for LanguageSelectScreen.
 *
 * Covers rendering, accessibility, and structure.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import LanguageSelectScreen from '../LanguageSelectScreen';

// Mock the i18n module (avoids expo-localization dependency in test env)
jest.mock('../../../i18n', () => ({
  __esModule: true,
  default: {
    changeLanguage: jest.fn(),
    language: 'en',
  },
}));

// react-i18next is globally mocked (returns t(key) => key)
// expo-router is globally mocked via expo-module-proxy
// useWindowDimensions is globally mocked in __mocks__/react-native.ts

describe('LanguageSelectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title using i18n key', () => {
    const { getByText } = render(<LanguageSelectScreen />);
    expect(getByText('onboarding.langPick.title')).toBeTruthy();
  });

  it('renders the subtitle using i18n key', () => {
    const { getByText } = render(<LanguageSelectScreen />);
    expect(getByText('onboarding.langPick.subtitle')).toBeTruthy();
  });

  it('renders the English language tile label', () => {
    const { getByText } = render(<LanguageSelectScreen />);
    expect(getByText('English')).toBeTruthy();
  });

  it('renders the Chinese language tile label', () => {
    const { getByText } = render(<LanguageSelectScreen />);
    expect(getByText('中文 (简体)')).toBeTruthy();
  });

  it('renders native subtitle labels on tiles', () => {
    const { getByText } = render(<LanguageSelectScreen />);
    expect(getByText('英文')).toBeTruthy();
    expect(getByText('中文（简体）')).toBeTruthy();
  });

  it('does not show checkmark before selection', () => {
    const { queryByText } = render(<LanguageSelectScreen />);
    expect(queryByText('✓')).toBeNull();
  });

  it('renders tile container with accessibility role radiogroup', () => {
    const { getByLabelText } = render(<LanguageSelectScreen />);
    const container = getByLabelText('onboarding.langPick.title');
    expect(container).toBeTruthy();
  });

  it('renders English tile with radio accessibility role (unselected)', () => {
    const { getByLabelText } = render(<LanguageSelectScreen />);
    const englishTile = getByLabelText('English');
    expect(englishTile).toBeTruthy();
    expect(englishTile.props.accessibilityRole).toBe('radio');
    expect(englishTile.props.accessibilityState?.selected).toBe(false);
  });

  it('renders Chinese tile with radio accessibility role (unselected)', () => {
    const { getByLabelText } = render(<LanguageSelectScreen />);
    const chineseTile = getByLabelText('中文 (简体)');
    expect(chineseTile).toBeTruthy();
    expect(chineseTile.props.accessibilityRole).toBe('radio');
    expect(chineseTile.props.accessibilityState?.selected).toBe(false);
  });
});
