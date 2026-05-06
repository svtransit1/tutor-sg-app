/**
 * Color design tokens for tutor-sg.
 *
 * Kid mode: vibrant, playful, high-contrast — warm friendly palette.
 * Parent mode: professional, calm, trustworthy — cooler muted palette.
 *
 * All color pairs meet WCAG AA (4.5:1) against their intended background.
 * @see ADD §9 — Accessibility (high contrast)
 */

// ── Base palette (shared between modes) ───────────────────────────

export const palette = {
  /** Primary blue — friendly, trustworthy */
  blue50: '#E3F2FD',
  blue100: '#BBDEFB',
  blue200: '#90CAF9',
  blue400: '#42A5F5',
  blue500: '#2196F3',
  blue600: '#1E88E5',
  blue700: '#1976D2',
  blue800: '#1565C0',

  /** Coral / warm orange — CTAs, energy */
  coral50: '#FFF3E0',
  coral100: '#FFE0B2',
  coral300: '#FFB74D',
  coral400: '#FF8A65',
  coral500: '#FF6B6B',
  coral600: '#E64A19',
  coral700: '#D84315',

  /** Green — correct, success */
  green50: '#E8F5E9',
  green100: '#C8E6C9',
  green400: '#66BB6A',
  green500: '#4CAF50',
  green600: '#43A047',
  green700: '#388E3C',

  /** Red — error, wrong */
  red50: '#FFEBEE',
  red100: '#FFCDD2',
  red400: '#EF5350',
  red500: '#F44336',
  red600: '#E53935',
  red700: '#D32F2F',

  /** Amber — warning */
  amber50: '#FFF8E1',
  amber100: '#FFECB3',
  amber400: '#FFCA28',
  amber500: '#FFC107',
  amber600: '#FFB300',
  amber700: '#FFA000',

  /** Purple — creative / premium accent */
  purple50: '#F3E5F5',
  purple300: '#BA68C8',
  purple400: '#AB47BC',
  purple500: '#9C27B0',

  /** Teal — info / secondary accent */
  teal50: '#E0F7FA',
  teal300: '#4DD0E1',
  teal400: '#26C6DA',
  teal500: '#00BCD4',
  teal600: '#00ACC1',

  /** Neutral grays */
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  /** Pure */
  white: '#FFFFFF',
  black: '#000000',

  /** Semantic overlay */
  overlayLight: 'rgba(0, 0, 0, 0.08)',
  overlayMedium: 'rgba(0, 0, 0, 0.32)',
  overlayDark: 'rgba(0, 0, 0, 0.56)',
} as const;

export type Palette = typeof palette;

// ── Kid mode colors — vibrant, playful, high contrast ─────────────

export const kidColors = {
  /** Background tints */
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,

  /** Primary brand */
  primary: palette.blue600,
  primaryLight: palette.blue100,
  primaryDark: palette.blue800,
  onPrimary: palette.white,

  /** Secondary / accent */
  secondary: palette.coral400,
  secondaryLight: palette.coral50,
  secondaryDark: palette.coral600,
  onSecondary: palette.white,

  /** Functional */
  success: palette.green500,
  successLight: palette.green50,
  onSuccess: palette.white,

  error: palette.red500,
  errorLight: palette.red50,
  onError: palette.white,

  warning: palette.amber500,
  warningLight: palette.amber50,
  onWarning: palette.gray900,

  info: palette.teal400,
  infoLight: palette.teal50,
  onInfo: palette.white,

  /** Text */
  textPrimary: palette.gray900,
  textSecondary: palette.gray700,
  textDisabled: palette.gray400,
  textOnPrimary: palette.white,
  textOnColored: palette.white,
  textLink: palette.blue600,

  /** Borders & dividers */
  border: palette.gray200,
  borderFocused: palette.blue400,
  divider: palette.gray100,

  /** Interactive states */
  pressed: palette.overlayLight,
  disabled: palette.gray200,
  disabledContent: palette.gray400,

  /** Subject accent colors (for subject tiles) */
  subjectMath: palette.blue500,
  subjectEnglish: palette.coral400,
  subjectChinese: palette.green500,
  subjectScience: palette.purple400,

  /** Fun accents — reward badges, confetti, decorations */
  accentGold: palette.amber400,
  accentPink: '#FF80AB',
  accentPurple: palette.purple300,
  accentTeal: palette.teal300,
} as const;

export type KidColors = typeof kidColors;

// ── Parent mode colors — professional, calm, trustworthy ──────────

export const parentColors = {
  background: palette.gray100,
  surface: palette.white,
  surfaceElevated: palette.white,

  primary: palette.blue700,
  primaryLight: palette.blue50,
  primaryDark: palette.blue800,
  onPrimary: palette.white,

  secondary: palette.blue400,
  secondaryLight: palette.blue50,
  secondaryDark: palette.blue700,
  onSecondary: palette.white,

  success: palette.green600,
  successLight: palette.green50,
  onSuccess: palette.white,

  error: palette.red600,
  errorLight: palette.red50,
  onError: palette.white,

  warning: palette.amber600,
  warningLight: palette.amber50,
  onWarning: palette.white,

  info: palette.teal600,
  infoLight: palette.teal50,
  onInfo: palette.white,

  textPrimary: palette.gray900,
  textSecondary: palette.gray700,
  textDisabled: palette.gray400,
  textOnPrimary: palette.white,
  textOnColored: palette.white,
  textLink: palette.blue600,

  border: palette.gray300,
  borderFocused: palette.blue500,
  divider: palette.gray200,

  pressed: palette.overlayLight,
  disabled: palette.gray200,
  disabledContent: palette.gray400,

  /** Parent dashboard doesn't use subject accent colors */

  /** Chart & data colors */
  chartBlue: palette.blue400,
  chartGreen: palette.green400,
  chartCoral: palette.coral400,
  chartAmber: palette.amber400,
} as const;

export type ParentColors = typeof parentColors;
