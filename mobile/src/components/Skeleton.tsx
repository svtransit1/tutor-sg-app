import React, { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  isDark?: boolean;
  style?: ViewStyle;
}

function Skeleton({ width = '100%', height = 20, borderRadius = 4, isDark = false, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#333' : '#E1E1E1',
          opacity,
        },
        style,
      ]}
    />
  );
}

function SkeletonCircle({ size = 28, isDark = false }: { size?: number; isDark?: boolean }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} isDark={isDark} />;
}

function SkeletonButton({ height = 44, isDark = false, style }: { height?: number; isDark?: boolean; style?: ViewStyle }) {
  return <Skeleton width="100%" height={height} borderRadius={8} isDark={isDark} style={style} />;
}

Skeleton.Circle = SkeletonCircle;
Skeleton.Button = SkeletonButton;

export { Skeleton };
