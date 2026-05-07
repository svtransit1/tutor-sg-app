import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

describe('vitest — pure logic', () => {
  it('asserts', () => { expect(1+1).toBe(2); });
  it('async', async () => { const r = await Promise.resolve(42); expect(r).toBe(42); });
  it('vi.fn', () => { const f = vi.fn((x: number) => x*2); expect(f(3)).toBe(6); });
});

describe('vitest — RNTL', () => {
  it('renders View+Text with render', async () => {
    const RNTL = await import('@testing-library/react-native');
    const RN = await import('react-native');
    RNTL.render(
      React.createElement(RN.View, { testID: 'root-view' },
        React.createElement(RN.Text, { testID: 'greeting' }, 'Hello Vitest!'),
      ),
    );
    expect(RNTL.screen.getByTestId('greeting')).toBeTruthy();
    expect(RNTL.screen.getByTestId('root-view')).toBeTruthy();
  });
});
