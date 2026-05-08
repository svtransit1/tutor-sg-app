/**
 * @tutor-sg/theme — Design tokens + ThemeProvider
 *
 * Kid-friendly React Native theme system for tutor-sg.
 * Provides color tokens, typography, spacing, borders, shadows,
 * and a React context provider for theme propagation.
 *
 * @see ADD §9 — Accessibility (high contrast, min 16pt body)
 * @see packages/theme/src/tokens/ — individual token modules
 */

// ── Theme provider & hook ──────────────────────────────────────────
export { ThemeProvider, ThemeContext } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { useTheme } from './useTheme';

// ── Types ──────────────────────────────────────────────────────────
export type {
  ThemeMode,
  AppMode,
  Theme,
  ThemeContextValue,
} from './types';

// ── Design tokens ──────────────────────────────────────────────────
export {
  lightColors,
  darkColors,
  kidColors,
  parentColors,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  typography,
  spacing,
  contentInset,
  touchTarget,
  borderRadius,
  borderWidth,
  shadowLevels,
  shadows,
} from './tokens';

// ── Font scale utilities (Dynamic Type aware) ─────────────────────
export { scaledFontSize, scaledLineHeight, scaledTouchTarget } from './utils/fontScale';

// ── Token types ────────────────────────────────────────────────────
export type {
  ColorTokens,
  FontSize,
  LineHeight,
  FontWeight,
  LetterSpacing,
  Typography,
  Spacing,
  ContentInset,
  TouchTarget,
  BorderRadius,
  BorderWidth,
  ShadowLevels,
  Shadows,
} from './tokens';
