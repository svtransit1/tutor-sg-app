/**
 * Spacing design tokens for tutor-sg.
 *
 * 8-point grid system with 4px micro step.
 * Kid-friendly: generous padding on interactive elements.
 * All values in logical pixels (React Native DP).
 */

export const spacing = {
  /** 2px — micro */
  xxs: 2,
  /** 4px — tiny gap */
  xs: 4,
  /** 8px — small gap */
  sm: 8,
  /** 12px — medium-small */
  md: 12,
  /** 16px — default / base */
  lg: 16,
  /** 20px — generous */
  xl: 20,
  /** 24px — large */
  xxl: 24,
  /** 32px — section */
  xxxl: 32,
  /** 40px — big section */
  huge: 40,
  /** 48px — page padding / hero */
  massive: 48,
} as const;

export type Spacing = typeof spacing;

/**
 * Content inset presets for common elements.
 * Uses logical `padding` values.
 */
export const contentInset = {
  /** Page-level horizontal padding */
  page: { horizontal: spacing.lg, vertical: spacing.xxl },
  /** Card padding */
  card: { horizontal: spacing.lg, vertical: spacing.lg },
  /** Section header padding */
  sectionHeader: { horizontal: spacing.lg, vertical: spacing.md },
  /** Button padding (minimum touch target 44pt) */
  button: {
    small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
    medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    large: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl },
  },
} as const;

export type ContentInset = typeof contentInset;

/**
 * Minimum touch target sizes (Apple HIG / Material Design).
 * All interactive elements must be at least 44pt.
 */
export const touchTarget = {
  minimum: 44,
  icon: 44,
  avatar: 40,
  chip: 32,
} as const;

export type TouchTarget = typeof touchTarget;
