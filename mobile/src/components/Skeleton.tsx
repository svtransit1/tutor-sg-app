import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  isDark?: boolean;
  style?: ViewStyle;
}

function SkeletonBlock({ width = '100%', height = 20, borderRadius = 4, isDark, style }: SkeletonProps) {
  return (
    <View
      style={[{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: isDark ? '#333' : '#E5E7EB',
      }, style]}
    />
  );
}

SkeletonBlock.Circle = function SkeletonCircle({ size = 28, isDark }: { size?: number; isDark?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isDark ? '#333' : '#E5E7EB',
      }}
    />
  );
};

SkeletonBlock.Button = function SkeletonButton({ height = 44, isDark, style }: { height?: number; isDark?: boolean; style?: ViewStyle }) {
  return (
    <View
      style={[{
        height,
        borderRadius: 12,
        backgroundColor: isDark ? '#333' : '#E5E7EB',
      }, style]}
    />
  );
};

export const Skeleton = SkeletonBlock;
