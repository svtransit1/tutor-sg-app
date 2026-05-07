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
  it('renders View+Text with renderAsync', async () => {
    const RNTL = await import('@testing-library/react-native');
    const RN = await import('react-native');
    await RNTL.renderAsync(React.createElement(RN.View, null,
      React.createElement(RN.Text, { accessibilityLabel: 'hello' }, 'Hello Vitest!'),
    ));
    expect(RNTL.screen.getByLabelText('hello')).toBeTruthy();
  });
});
