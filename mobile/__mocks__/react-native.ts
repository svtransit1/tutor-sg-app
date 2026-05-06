// Mock react-native for Jest (node environment)

const mockAnimatedValue = {
  setValue: jest.fn(),
  interpolate: jest.fn(() => ({})),
};

const mockAnimatedNode = {
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

const ReactNative = {
  Platform: {
    OS: 'ios',
    Version: '18.0',
    select: (obj: Record<string, unknown>) => obj.ios ?? obj.default,
  },
  useColorScheme: () => 'light',
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
    flatten: (styles: any) => styles,
  },
  View: 'View',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Linking: {
    openURL: jest.fn(),
  },
  Animated: {
    Value: jest.fn(() => mockAnimatedValue),
    View: 'View',
    Text: 'Text',
    spring: jest.fn(() => mockAnimatedNode),
    timing: jest.fn(() => mockAnimatedNode),
    parallel: jest.fn(() => mockAnimatedNode),
    sequence: jest.fn(() => mockAnimatedNode),
    stagger: jest.fn(() => mockAnimatedNode),
    loop: jest.fn(() => mockAnimatedNode),
  },
};

module.exports = ReactNative;
