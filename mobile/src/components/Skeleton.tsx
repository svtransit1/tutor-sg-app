import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';

const SHIMMER_DURATION = 900;
const SKELETON_BG_LIGHT = '#E5E7EB';
const SKELETON_BG_DARK = '#333333';
const HIGHLIGHT_LIGHT = '#F3F4F6';
const HIGHLIGHT_DARK = '#444444';

interface SkeletonPrimitiveProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  isDark: boolean;
}

function ShimmerOverlay({
  isDark,
  borderRadius,
}: {
  isDark: boolean;
  borderRadius: number;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: SHIMMER_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: SHIMMER_DURATION / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark ? HIGHLIGHT_DARK : HIGHLIGHT_LIGHT,
          opacity,
          borderRadius,
        },
      ]}
      pointerEvents="none"
    />
  );
}

function SkeletonPrimitive({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
  isDark,
}: SkeletonPrimitiveProps) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? SKELETON_BG_DARK : SKELETON_BG_LIGHT,
          overflow: 'hidden',
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading"
      accessibilityLiveRegion="polite"
    >
      <ShimmerOverlay isDark={isDark} borderRadius={borderRadius} />
    </View>
  );
}

export const Skeleton = Object.assign(SkeletonPrimitive, {
  Line: function SkeletonLine({
    width,
    isDark,
    style,
  }: {
    width?: DimensionValue;
    isDark: boolean;
    style?: ViewStyle;
  }) {
    return (
      <SkeletonPrimitive
        width={width ?? '100%'}
        height={14}
        borderRadius={7}
        isDark={isDark}
        style={style}
      />
    );
  },
  Circle: function SkeletonCircle({
    size = 48,
    isDark,
    style,
  }: {
    size?: number;
    isDark: boolean;
    style?: ViewStyle;
  }) {
    return (
      <SkeletonPrimitive
        width={size}
        height={size}
        borderRadius={size / 2}
        isDark={isDark}
        style={style}
      />
    );
  },
  Card: function SkeletonCard({
    height = 120,
    isDark,
    style,
  }: {
    height?: number;
    isDark: boolean;
    style?: ViewStyle;
  }) {
    return (
      <SkeletonPrimitive
        width="100%"
        height={height}
        borderRadius={14}
        isDark={isDark}
        style={style}
      />
    );
  },
  Button: function SkeletonButton({
    height = 52,
    isDark,
    style,
  }: {
    height?: number;
    isDark: boolean;
    style?: ViewStyle;
  }) {
    return (
      <SkeletonPrimitive
        width="100%"
        height={height}
        borderRadius={12}
        isDark={isDark}
        style={style}
      />
    );
  },
});
