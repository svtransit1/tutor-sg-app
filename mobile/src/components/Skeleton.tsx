/**
 * Reusable skeleton/shimmer components for loading states.
 *
 * Provides animated placeholder shapes that pulse with a shimmer effect.
 * Use these wherever async content is loading to communicate progress
 * and reduce perceived latency.
 *
 * Architecture:
 * - SkeletonBox: generic rounded rectangle (cards, tiles, buttons)
 * - SkeletonCircle: circular placeholder (avatars, icons)
 * - SkeletonLine: text-line placeholder (headings, body text, labels)
 * - SkeletonCard: opinionated card skeleton with icon + lines
 * - SkeletonSubjectGrid: 2×2 grid of subject tile skeletons
 * - SkeletonSessionList: session card skeletons
 * - SkeletonOnboardingPage: full-page onboarding skeleton
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ViewStyle,
  useColorScheme,
  Easing,
} from 'react-native';

// ── Hook: Shimmer Opacity ──────────────────────────────────────────

function useShimmerAnimation(speed = 1200): Animated.Value {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: speed / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: speed / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, speed]);

  return opacity;
}

// ── Colors ─────────────────────────────────────────────────────────

function useSkeletonColors(isDark: boolean) {
  return {
    base: isDark ? '#2A2A2A' : '#E5E7EB',
    highlight: isDark ? '#3A3A3A' : '#F3F4F6',
  };
}

// ── SkeletonBox ────────────────────────────────────────────────────

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  isDark?: boolean;
}

export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  isDark: forcedDark,
}: SkeletonBoxProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;
  const colors = useSkeletonColors(isDark);
  const opacity = useShimmerAnimation();

  return (
    <Animated.View
      style={[
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: colors.base,
          opacity,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading"
    />
  );
}

// ── SkeletonCircle ─────────────────────────────────────────────────

interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
  isDark?: boolean;
}

export function SkeletonCircle({
  size = 48,
  style,
  isDark: forcedDark,
}: SkeletonCircleProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;
  const colors = useSkeletonColors(isDark);
  const opacity = useShimmerAnimation();

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.base,
          opacity,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading"
    />
  );
}

// ── SkeletonLine ───────────────────────────────────────────────────

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  isDark?: boolean;
}

export function SkeletonLine({
  width = '100%',
  height = 14,
  style,
  isDark: forcedDark,
}: SkeletonLineProps) {
  return (
    <SkeletonBox
      width={width}
      height={height}
      borderRadius={height / 3}
      style={style}
      isDark={forcedDark}
    />
  );
}

// ── SkeletonCard ───────────────────────────────────────────────────

interface SkeletonCardProps {
  style?: ViewStyle;
  lines?: number;
  showIcon?: boolean;
  iconSize?: number;
  isDark?: boolean;
}

export function SkeletonCard({
  style,
  lines = 2,
  showIcon = true,
  iconSize = 36,
  isDark: forcedDark,
}: SkeletonCardProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;
  const colors = useSkeletonColors(isDark);
  const opacity = useShimmerAnimation();

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: colors.base,
          opacity,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading"
    >
      <View style={styles.cardRow}>
        {showIcon && (
          <SkeletonCircle size={iconSize} isDark={isDark} style={styles.cardIcon} />
        )}
        <View style={styles.cardLines}>
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLine
              key={i}
              width={i === lines - 1 && lines > 1 ? '60%' : '85%'}
              height={i === 0 ? 16 : 12}
              style={i < lines - 1 ? { marginBottom: 6 } : undefined}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ── SkeletonSubjectGrid (2×2) ──────────────────────────────────────

interface SkeletonSubjectGridProps {
  isDark?: boolean;
}

export function SkeletonSubjectGrid({ isDark: forcedDark }: SkeletonSubjectGridProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;

  return (
    <View style={styles.subjectGrid} accessibilityRole="image" accessibilityLabel="Loading subjects">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={140}
          borderRadius={16}
          style={styles.subjectTileSkeleton}
          isDark={isDark}
        />
      ))}
    </View>
  );
}

// ── SkeletonSessionList ────────────────────────────────────────────

interface SkeletonSessionListProps {
  count?: number;
  isDark?: boolean;
}

export function SkeletonSessionList({
  count = 3,
  isDark: forcedDark,
}: SkeletonSessionListProps) {
  return (
    <View style={styles.sessionList} accessibilityRole="image" accessibilityLabel="Loading sessions">
      <SkeletonLine width={120} height={18} style={{ marginBottom: 14 }} isDark={forcedDark} />
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} showIcon iconSize={28} isDark={forcedDark} />
      ))}
    </View>
  );
}

// ── SkeletonCameraButton ───────────────────────────────────────────

interface SkeletonCameraButtonProps {
  isDark?: boolean;
}

export function SkeletonCameraButton({ isDark: forcedDark }: SkeletonCameraButtonProps) {
  return (
    <SkeletonBox
      height={72}
      borderRadius={16}
      style={{ marginBottom: 20 }}
      isDark={forcedDark}
    />
  );
}

// ── SkeletonOnboardingPage ─────────────────────────────────────────

interface SkeletonOnboardingPageProps {
  isDark?: boolean;
  showProgressDots?: boolean;
  subtitle?: boolean;
}

export function SkeletonOnboardingPage({
  isDark: forcedDark,
  showProgressDots = true,
  subtitle = true,
}: SkeletonOnboardingPageProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;

  return (
    <View style={styles.onboardingPage} accessibilityRole="image" accessibilityLabel="Loading">
      {/* Progress dots */}
      {showProgressDots && (
        <View style={styles.progressRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox
              key={i}
              width={i === 1 ? 32 : 8}
              height={8}
              borderRadius={4}
              style={{ marginRight: 6 }}
              isDark={isDark}
            />
          ))}
        </View>
      )}

      {/* Icon circle */}
      <SkeletonCircle size={80} style={{ marginBottom: 28, alignSelf: 'center' }} isDark={isDark} />

      {/* Title */}
      <SkeletonLine width="65%" height={28} style={{ marginBottom: 12, alignSelf: 'center' }} isDark={isDark} />

      {/* Subtitle */}
      {subtitle && (
        <SkeletonLine width="80%" height={16} style={{ marginBottom: 48, alignSelf: 'center' }} isDark={isDark} />
      )}

      {/* Main content area */}
      <SkeletonBox height={200} borderRadius={16} style={{ marginBottom: 24 }} isDark={isDark} />

      {/* Button */}
      <SkeletonBox height={56} borderRadius={14} isDark={isDark} />
    </View>
  );
}

// ── SkeletonDeviceCheck ────────────────────────────────────────────

interface SkeletonDeviceCheckProps {
  isDark?: boolean;
}

export function SkeletonDeviceCheck({ isDark: forcedDark }: SkeletonDeviceCheckProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;

  return (
    <View style={styles.onboardingPage} accessibilityRole="image" accessibilityLabel="Checking device">
      {/* Icon */}
      <SkeletonCircle size={64} style={{ marginBottom: 24, alignSelf: 'center' }} isDark={isDark} />

      {/* Title */}
      <SkeletonLine width="55%" height={24} style={{ marginBottom: 12, alignSelf: 'center' }} isDark={isDark} />

      {/* Body lines */}
      <SkeletonLine width="75%" height={14} style={{ marginBottom: 6, alignSelf: 'center' }} isDark={isDark} />
      <SkeletonLine width="60%" height={14} style={{ marginBottom: 40, alignSelf: 'center' }} isDark={isDark} />

      {/* Spec card */}
      <SkeletonBox height={120} borderRadius={12} style={{ marginBottom: 36 }} isDark={isDark} />

      {/* Button */}
      <SkeletonBox height={56} borderRadius={14} isDark={isDark} />
    </View>
  );
}

// ── SkeletonDownloadPrep ───────────────────────────────────────────

interface SkeletonDownloadPrepProps {
  isDark?: boolean;
}

export function SkeletonDownloadPrep({ isDark: forcedDark }: SkeletonDownloadPrepProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;

  return (
    <View style={styles.onboardingPage} accessibilityRole="image" accessibilityLabel="Preparing download">
      {/* Mascot */}
      <SkeletonCircle size={100} style={{ marginBottom: 24, alignSelf: 'center' }} isDark={isDark} />

      {/* Title */}
      <SkeletonLine width="60%" height={24} style={{ marginBottom: 12, alignSelf: 'center' }} isDark={isDark} />

      {/* Body */}
      <SkeletonLine width="80%" height={14} style={{ marginBottom: 6, alignSelf: 'center' }} isDark={isDark} />
      <SkeletonLine width="70%" height={14} style={{ marginBottom: 40, alignSelf: 'center' }} isDark={isDark} />

      {/* Progress bar */}
      <SkeletonBox height={8} borderRadius={4} style={{ marginBottom: 12 }} isDark={isDark} />
      <SkeletonLine width="40%" height={16} style={{ marginBottom: 24, alignSelf: 'center' }} isDark={isDark} />

      {/* Button */}
      <SkeletonBox height={56} borderRadius={14} style={{ marginBottom: 16 }} isDark={isDark} />

      {/* Footer link */}
      <SkeletonLine width="50%" height={13} style={{ alignSelf: 'center' }} isDark={isDark} />
    </View>
  );
}

// ── SkeletonWelcomeHero ────────────────────────────────────────────

interface SkeletonWelcomeHeroProps {
  isDark?: boolean;
}

export function SkeletonWelcomeHero({ isDark: forcedDark }: SkeletonWelcomeHeroProps) {
  const systemDark = useColorScheme() === 'dark';
  const isDark = forcedDark ?? systemDark;

  return (
    <View style={[styles.welcomeHero, { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' }]}>
      <SkeletonCircle size={72} style={{ marginBottom: 12 }} isDark={isDark} />
      <SkeletonLine width="65%" height={24} style={{ marginBottom: 8 }} isDark={isDark} />
      <SkeletonLine width="85%" height={14} style={{ marginBottom: 4 }} isDark={isDark} />
      <SkeletonLine width="55%" height={14} style={{ marginBottom: 20 }} isDark={isDark} />
      <SkeletonBox height={52} borderRadius={14} style={{ marginBottom: 16 }} isDark={isDark} />
      <View style={styles.chipRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} width={80} height={36} borderRadius={20} isDark={isDark} />
        ))}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLines: {
    flex: 1,
  },

  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  subjectTileSkeleton: {
    width: '47%',
  },

  sessionList: {
    marginBottom: 8,
  },

  onboardingPage: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  welcomeHero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 8,
    gap: 4,
  },

  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
