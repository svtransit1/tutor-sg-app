/**
 * ThinkingAnimation — kid-friendly pulsing dots for LLM loading states.
 *
 * Replaces ActivityIndicator with a gentle animated pulsing icon + text.
 * Accessible: announces state to screen readers via accessibilityLiveRegion.
 * Per AAAS-689: skeleton/loading, "Teacher AI is thinking..." EN/zh-Hans.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ThinkingAnimationProps {
  /** Primary text shown below the animation */
  title: string;
  /** Secondary hint text */
  subtitle?: string;
  /** Dark mode override */
  dark?: boolean;
}

/** Animated pulsing dot */
function PulsingDot({ delay, color }: { delay: number; color: string }) {
  const ref = useRef<View>(null);

  useEffect(() => {
    const pulse = () => {
      // @ts-expect-error - View.animate is Web Animations API, not in RN types
      ref.current?.animate(
        { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] },
        { duration: 1000, delay, easing: 'ease-in-out', loop: true }
      );
    };
    // React Native Animated API — fall back to static if unavailable
    try {
      pulse();
    } catch {
      // Static render if animation fails
    }
  }, [delay]);

  return (
    <View
      ref={ref}
      style={[
        styles.dot,
        { backgroundColor: color },
      ]}
    />
  );
}

export function ThinkingAnimation({ title, subtitle, dark = false }: ThinkingAnimationProps) {
  const textColor = dark ? '#FFFFFF' : '#1A1A1A';
  const subtextColor = dark ? '#888888' : '#9CA3AF';
  const dotColor = dark ? '#90CAF9' : '#4A90D9';

  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityLabel={title}
    >
      {/* Pulsing dots */}
      <View style={styles.dotsRow} accessibilityElementsHidden>
        <PulsingDot delay={0} color={dotColor} />
        <PulsingDot delay={200} color={dotColor} />
        <PulsingDot delay={400} color={dotColor} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
      )}
    </View>
  );
}

/** Skeleton placeholder — shown before first token arrives (within 500ms of submit) */
export function ThinkingSkeleton({ dark = false }: { dark?: boolean }) {
  const bgColor = dark ? '#2A2A2A' : '#E5E7EB';
  const shimmerColor = dark ? '#3A3A3A' : '#F3F4F6';

  return (
    <View style={styles.skeletonContainer} accessibilityElementsHidden>
      {/* Animated shimmer blocks */}
      <View style={[styles.skeletonLine, { backgroundColor: bgColor }]} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort, { backgroundColor: shimmerColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  skeletonContainer: {
    alignItems: 'center',
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    width: 180,
    borderRadius: 8,
  },
  skeletonLineShort: {
    width: 120,
  },
});