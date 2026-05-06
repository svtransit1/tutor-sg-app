// Mock react-native for Jest (node environment)
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
};

module.exports = ReactNative;
