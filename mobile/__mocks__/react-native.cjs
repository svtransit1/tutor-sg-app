const React = require('react');
function C(name) { return (p) => React.createElement(name, p, p.children); }
module.exports = {
  View: C('View'), Text: C('Text'), TextInput: C('TextInput'),
  TouchableOpacity: C('TouchableOpacity'), TouchableHighlight: C('TouchableHighlight'),
  ScrollView: C('ScrollView'), FlatList: C('FlatList'), Image: C('Image'),
  ActivityIndicator: C('ActivityIndicator'), SafeAreaView: C('SafeAreaView'),
  KeyboardAvoidingView: C('KeyboardAvoidingView'), Pressable: C('Pressable'),
  Modal: C('Modal'), StatusBar: () => null,
  Animated: { View: C('Animated.View'), Text: C('Animated.Text'),
    Value: () => ({_value:0,setValue(){},interpolate(){}}),
    timing: () => ({start(cb){cb?.()}}), spring: () => ({start(cb){cb?.()}}),
    createAnimatedComponent: (C) => C },
  Platform: { OS: 'ios', Version: '16.0', select: (o) => o.ios ?? o.default },
  Dimensions: { get: () => ({width:390,height:844}) },
  StyleSheet: { create: (s) => s, flatten: (s) => s, hairlineWidth: 0.5,
    absoluteFill: {position:'absolute',top:0,left:0,right:0,bottom:0} },
  PixelRatio: { get: () => 3, getFontScale: () => 1 },
  I18nManager: { isRTL: false }, useColorScheme: () => 'light',
  NativeModules: { UIManager: {}, PlatformConstants: {} },
  Appearance: { getColorScheme: () => 'light' },
};
