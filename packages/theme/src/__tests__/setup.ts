// Vitest setup for @tutor-sg/theme tests.
// Mocks react-native modules so design tokens load without native runtime.

import { vi } from 'vitest';

// Mock react-native Platform and base components
vi.mock('react-native', () => {
  const Platform = {
    OS: 'ios',
    select: <T>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
      obj.ios ?? obj.default,
  };

  const createMockComponent = (name: string) => {
    const Component = ({ children, ...props }: Record<string, unknown>) => {
      const React = require('react');
      return React.createElement('View', props, children);
    };
    Component.displayName = name;
    return Component;
  };

  return {
    Platform,
    StyleSheet: {
      create: (styles: Record<string, object>) => styles,
      hairlineWidth: () => 0.5,
      absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
      absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    },
    Text: createMockComponent('Text'),
    View: createMockComponent('View'),
    Pressable: createMockComponent('Pressable'),
    Image: createMockComponent('Image'),
    TextInput: createMockComponent('TextInput'),
    ScrollView: createMockComponent('ScrollView'),
    Dimensions: {
      get: () => ({ width: 390, height: 844, scale: 3 }),
    },
    PixelRatio: {
      get: () => 3,
      roundToNearestPixel: (v: number) => Math.round(v * 3) / 3,
    },
    Appearance: {
      getColorScheme: () => 'light',
    },
    processColor: (color: string) => color,
    // Add this for @testing-library/react-native compat
    TurboModuleRegistry: {
      getEnforcing: () => null,
    },
    NativeModules: {},
  };
});
