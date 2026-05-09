import React from 'react';
import { View, type DimensionValue, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  isDark?: boolean;
  style?: ViewStyle;
}

interface SkeletonCircleProps {
  size?: number;
  isDark?: boolean;
  style?: ViewStyle;
}

interface SkeletonButtonProps {
  height?: number;
  isDark?: boolean;
  style?: ViewStyle;
}

function SkeletonBase({
  width,
  height = 20,
  borderRadius = 6,
  isDark,
  style,
}: SkeletonProps) {
  return (
    <View
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius,
          backgroundColor: isDark ? '#333333' : '#E0E0E0',
        },
        style,
      ]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function SkeletonCircle({ size = 28, isDark, style }: SkeletonCircleProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? '#333333' : '#E0E0E0',
        },
        style,
      ]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function SkeletonButton({ height = 44, isDark, style }: SkeletonButtonProps) {
  return (
    <View
      style={[
        {
          width: '100%' as DimensionValue,
          height,
          borderRadius: 12,
          backgroundColor: isDark ? '#333333' : '#E0E0E0',
        },
        style,
      ]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export const Skeleton = Object.assign(SkeletonBase, {
  Circle: SkeletonCircle,
  Button: SkeletonButton,
});
