/**
 * useTheme hook — access the current theme from any component.
 *
 * ```tsx
 * const { theme, setMode, mode } = useTheme();
 * ```
 *
 * Throws if used outside of <ThemeProvider>.
 *
 * @see ThemeProvider
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './types';

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      'useTheme must be used within a <ThemeProvider>. ' +
      'Wrap your component tree with <ThemeProvider> at the entry point.',
    );
  }
  return ctx;
}
