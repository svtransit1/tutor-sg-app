import React from 'react';
import { View } from 'react-native';

export const useSafeAreaInsets = () => ({
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
});

export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 390,
  height: 844,
});

export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'safe-area-provider' }, children);

export const SafeAreaConsumer = ({ children }: { children: (insets: ReturnType<typeof useSafeAreaInsets>) => React.ReactNode }) =>
  React.createElement(View, null, children(useSafeAreaInsets()));

export const SafeAreaView = ({ children, ...props }: React.ComponentProps<typeof View>) =>
  React.createElement(View, props, children);

export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, bottom: 34, left: 0, right: 0 },
};

export default {
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaProvider,
  SafeAreaConsumer,
  SafeAreaView,
  initialWindowMetrics,
};
