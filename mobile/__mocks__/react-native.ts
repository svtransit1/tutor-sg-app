const React = require('react')

const mockComponent = (name: string) => {
  const Comp = React.forwardRef((props: any, ref: any) => {
    const { children } = props
    return React.createElement(name as any, { ...props, ref }, children)
  })
  Comp.displayName = name
  return Comp
}

export const View = mockComponent('View')
export const Text = mockComponent('Text')
export const TextInput = mockComponent('TextInput')
export const TouchableOpacity = mockComponent('TouchableOpacity')
export const ScrollView = mockComponent('ScrollView')
export const KeyboardAvoidingView = mockComponent('KeyboardAvoidingView')
export const RefreshControl = mockComponent('RefreshControl')
export const FlatList = mockComponent('FlatList')
export const SafeAreaView = mockComponent('SafeAreaView')
export const StatusBar = mockComponent('StatusBar')
export const ActivityIndicator = mockComponent('ActivityIndicator')
export const Image = mockComponent('Image')
export const Switch = mockComponent('Switch')
export const Pressable = mockComponent('Pressable')
export const Modal = mockComponent('Modal')

export const StyleSheet = {
  create: (styles: any) => styles,
  hairlineWidth: () => 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  flatten: (style: any) => style,
}

export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios ?? obj.default ?? null,
  Version: 15,
}

export const useColorScheme = () => 'light'
export const Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: () => ({ remove: () => {} }),
}
export const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
  addEventListener: () => ({ remove: () => {} }),
}
export const PixelRatio = {
  get: () => 2,
  roundToNearestPixel: (x: number) => Math.round(x * 2) / 2,
}
export const Animated = {
  View: mockComponent('AnimatedView'),
  Text: mockComponent('AnimatedText'),
  createAnimatedComponent: (comp: any) => comp,
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  spring: () => ({ start: (cb?: () => void) => cb?.() }),
  Value: (v: number) => ({
    __getValue: () => v,
    setValue: () => {},
    interpolate: () => ({ __getValue: () => v }),
  }),
}
export const Alert = { alert: () => {} }
export const findNodeHandle = (component: any) => 1
export const processColor = (color: any) => color
export const I18nManager = { isRTL: false, allowRTL: () => {}, forceRTL: () => {} }
export const AccessibilityInfo = {
  isScreenReaderEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
}

export default {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, RefreshControl, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator, Image, Switch, Pressable, Modal,
  StyleSheet, Platform, useColorScheme, Appearance, Dimensions, PixelRatio,
  Animated, Alert, findNodeHandle, processColor, I18nManager, AccessibilityInfo,
}
