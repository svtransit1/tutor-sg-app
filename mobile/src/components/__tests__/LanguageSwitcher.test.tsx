import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LanguageProvider } from '@/contexts/LanguageContext';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { __mockChangeLanguage } = require('react-i18next');

beforeEach(() => {
  __mockChangeLanguage.mockClear();
});

describe('LanguageSwitcher', () => {
  it('renders the toggle button', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('shows Chinese label when language is English', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    expect(screen.getByText('中')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe(
      'kidHome.header.switchLanguage',
    );
  });

  it('calls changeLanguage with zh-Hans when English', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(__mockChangeLanguage).toHaveBeenCalledWith('zh-Hans');
  });
});
