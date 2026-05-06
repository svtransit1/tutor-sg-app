import React from 'react';

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 390, height: 844 };

export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function SafeAreaView({ children, style }: any) {
  return React.createElement('View', { style }, children);
}

export function useSafeAreaInsets() {
  return insets;
}

export function useSafeAreaFrame() {
  return frame;
}

export const SafeAreaConsumer = ({
  children,
}: {
  children: (insets: typeof insets) => React.ReactNode;
}) => children(insets);

export const SafeAreaContext = React.createContext(insets);

export const SafeAreaInsetsContext = React.createContext(insets);
export const SafeAreaFrameContext = React.createContext(frame);

export const initialWindowMetrics = {
  insets,
  frame,
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaConsumer,
  SafeAreaContext,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  initialWindowMetrics,
};
