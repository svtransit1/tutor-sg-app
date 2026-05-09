/**
 * Jest setup file — runs after the test framework is configured.
 */

jest.mock('react-native/Libraries/ReactNative/UIManager', () => ({
  getViewManagerConfig: () => ({}),
  hasViewManagerConfig: () => false,
}));
