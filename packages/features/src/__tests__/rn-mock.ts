// Suppress react-test-renderer deprecation noise
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('react-test-renderer is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

jest.mock('react-native', () => {
  const React = require('react');
  const { createElement, forwardRef } = React;

  const mockComponent = (name: string) =>
    forwardRef((props: any, ref: any) =>
      createElement(name, { ...props, ref }),
    );

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TextInput: mockComponent('TextInput'),
    Pressable: mockComponent('Pressable'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    ActivityIndicator: mockComponent('ActivityIndicator'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
    Platform: {
      OS: 'ios',
      select: (obj: any) => (obj.ios !== undefined ? obj.ios : obj.default),
    },
    Image: mockComponent('Image'),
    Dimensions: {
      get: () => ({ width: 390, height: 844 }),
    },
    Animated: {
      View: mockComponent('AnimatedView'),
      Text: mockComponent('AnimatedText'),
    },
  };
});
