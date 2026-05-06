/**
 * Shadow design tokens for tutor-sg.
 *
 * Provides platform-specific shadow definitions for iOS and Android.
 * iOS uses native shadow properties, Android uses elevation.
 *
 * Kid-friendly: soft, warm shadows — nothing harsh.
 */

import { Platform, ViewStyle } from 'react-native';

type ShadowLevel = {
  /** Elevation (Android) */
  elevation: number;
  /** Shadow opacity (iOS) */
  shadowOpacity: number;
  /** Shadow radius (iOS) */
  shadowRadius: number;
  /** Shadow offset (iOS) */
  shadowOffset: { width: number; height: number };
  /** Shadow color (iOS) */
  shadowColor: string;
};

function shadowStyle(level: ShadowLevel): ViewStyle {
  if (Platform.OS === 'android') {
    return {
      elevation: level.elevation,
    };
  }

  // iOS
  return {
    shadowColor: level.shadowColor,
    shadowOffset: level.shadowOffset,
    shadowOpacity: level.shadowOpacity,
    shadowRadius: level.shadowRadius,
  };
}

export const shadowLevels = {
  /** No shadow */
  none: { elevation: 0, shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, shadowColor: '#000' },
  /** Subtle — cards on flat surface */
  sm: { elevation: 2, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, shadowColor: '#000' },
  /** Medium — raised cards, modals */
  md: { elevation: 4, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, shadowColor: '#000' },
  /** Large — dialogs, bottom sheets */
  lg: { elevation: 8, shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, shadowColor: '#000' },
  /** Extra large — FAB, top-level overlays */
  xl: { elevation: 12, shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 6 }, shadowColor: '#000' },
} as const;

export type ShadowLevels = typeof shadowLevels;

/**
 * Pre-computed shadow styles ready for use in StyleSheet.
 * Platform-aware: uses elevation on Android, native shadow on iOS.
 */
export const shadows = {
  none: shadowStyle(shadowLevels.none),
  sm: shadowStyle(shadowLevels.sm),
  md: shadowStyle(shadowLevels.md),
  lg: shadowStyle(shadowLevels.lg),
  xl: shadowStyle(shadowLevels.xl),
} as const;

export type Shadows = typeof shadows;
