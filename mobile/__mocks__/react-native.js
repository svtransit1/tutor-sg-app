/**
 * Mock for react-native — avoids Flow parsing errors in vitest.
 * Provides the minimum API surface our components need.
 *
 * This is used by vitest when resolving 'react-native' imports.
 * Jest would use 'react-native/jest/mock' but vitest can't parse Flow.
 */

const React = require('react');
const ReactNative = {};

// ── Core APIs ──────────────────────────────────────────────────────

ReactNative.StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  hairlineWidth: () => 1,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
};

ReactNative.Platform = {
  OS: 'ios',
  Version: '16.0',
  select: (objs) => objs.ios ?? objs.default,
};

ReactNative.Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

ReactNative.View = (props) => React.createElement('View', props, props.children);
ReactNative.Text = (props) => React.createElement('Text', props, props.children);
ReactNative.ScrollView = (props) => React.createElement('ScrollView', props, props.children);
ReactNative.SafeAreaView = (props) => React.createElement('SafeAreaView', props, props.children);
ReactNative.ActivityIndicator = (props) =>
  React.createElement('ActivityIndicator', props, props.children);
ReactNative.StatusBar = (props) => React.createElement('StatusBar', props);
ReactNative.TouchableOpacity = (props) =>
  React.createElement('TouchableOpacity', props, props.children);
// Pressable must pass onPress directly so fireEvent.press() from RNTL can invoke it
function MockPressable({ children, style, onPress, ...rest }) {
  const [pressed, setPressed] = React.useState(false);
  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  return React.createElement('Pressable', { ...rest, style: resolvedStyle, onPress }, children);
}
ReactNative.Pressable = MockPressable;
ReactNative.KeyboardAvoidingView = (props) =>
  React.createElement('KeyboardAvoidingView', props, props.children);

// ── Utilities ──────────────────────────────────────────────────────

ReactNative.ColorPropType = () => {};
ReactNative.EdgeInsetsPropType = () => {};
ReactNative.PointPropType = () => {};
ReactNative.ViewPropTypes = { style: () => {} };

ReactNative.I18nManager = {
  isRTL: false,
  allowRTL: () => {},
  forceRTL: () => {},
  swapLeftAndRightInRTL: () => {},
  getConstants: () => ({ isRTL: false, doLeftAndRightSwapInRTL: true }),
};

ReactNative.NativeModules = {
  ExpoSecureStore: {},
  SettingsManager: { settings: {} },
};

ReactNative.processColor = (color) => color;
ReactNative.PixelRatio = {
  get: () => 3,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size) => size,
  roundToNearestPixel: (size) => size,
  startDetecting: () => {},
};

// ── Animated (minimal) ─────────────────────────────────────────────

ReactNative.Animated = {
  Value: class Value {
    constructor(val) {
      this._value = val;
    }
    setValue(v) {
      this._value = v;
    }
    interpolate() {
      return this;
    }
    __getValue() {
      return this._value;
    }
  },
  timing: () => ({ start: (cb) => cb?.({ finished: true }) }),
  spring: () => ({ start: (cb) => cb?.({ finished: true }) }),
  decay: () => ({ start: (cb) => cb?.({ finished: true }) }),
  sequence: () => ({ start: (cb) => cb?.({ finished: true }) }),
  parallel: () => ({ start: (cb) => cb?.({ finished: true }) }),
  delay: () => ({ start: (cb) => cb?.({ finished: true }) }),
  View: (props) => React.createElement('Animated.View', props, props.children),
  Text: (props) => React.createElement('Animated.Text', props, props.children),
};

// ── AppRegistry ────────────────────────────────────────────────────

ReactNative.AppRegistry = {
  registerComponent: () => {},
  getAppKeys: () => [],
  setWrapperComponentProvider: () => {},
  registerConfig: () => {},
  runApplication: () => {},
  unmountApplicationComponentAtRootTag: () => {},
};

// ── Exports ────────────────────────────────────────────────────────

module.exports = ReactNative;
