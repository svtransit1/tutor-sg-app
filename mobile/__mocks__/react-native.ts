// Mock react-native for Jest (node environment)

const mockAnimatedValue = { setValue: jest.fn(), interpolate: jest.fn(() => ({})) };
const mockAnimatedNode = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };

class MockNativeEventEmitter {
  private listeners = new Map<string, Set<(...args: any[]) => void>>();
  addListener(eventType: string, listener: (...args: any[]) => void) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, new Set());
    this.listeners.get(eventType)!.add(listener);
    return { remove: () => { this.listeners.get(eventType)?.delete(listener); } };
  }
  removeAllListeners(eventType?: string) {
    eventType ? this.listeners.delete(eventType) : this.listeners.clear();
  }
  emit(eventType: string, ...args: any[]) {
    this.listeners.get(eventType)?.forEach((fn) => fn(...args));
  }
  removeSubscription(subscription: { remove: () => void }) { subscription.remove(); }
}

const ReactNative = {
  NativeModules: {},
  NativeEventEmitter: jest.fn().mockImplementation(() => new MockNativeEventEmitter()),
  DeviceEventEmitter: new MockNativeEventEmitter(),
  Platform: { OS: 'ios', Version: '18.0', select: (obj: Record<string, unknown>) => obj.ios ?? obj.default },
  useColorScheme: () => 'light',
  StyleSheet: { create: <T extends Record<string, unknown>>(styles: T): T => styles, flatten: (styles: any) => styles },
  View: 'View', Text: 'Text', useWindowDimensions: () => ({ width: 390, height: 844 }),
  ActivityIndicator: 'ActivityIndicator', TouchableOpacity: 'TouchableOpacity', ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  Linking: { openURL: jest.fn() },
  Animated: {
    Value: jest.fn(() => mockAnimatedValue), View: 'View', Text: 'Text',
    spring: jest.fn(() => mockAnimatedNode), timing: jest.fn(() => mockAnimatedNode),
    parallel: jest.fn(() => mockAnimatedNode), sequence: jest.fn(() => mockAnimatedNode),
    stagger: jest.fn(() => mockAnimatedNode), loop: jest.fn(() => mockAnimatedNode),
  },
};
module.exports = ReactNative;
