/**
 * Mock for expo-linking.
 * Provides getInitialURL, addEventListener, and removeEventListener
 * for testing auth deep link flows.
 */
const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

const Linking = {
  getInitialURL: jest.fn(async () => null),
  addEventListener: jest.fn((type: string, handler: (...args: unknown[]) => void) => {
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type)!.add(handler);
    return {
      remove: () => {
        listeners.get(type)?.delete(handler);
      },
    };
  }),
  removeEventListener: jest.fn((type: string, handler: (...args: unknown[]) => void) => {
    listeners.get(type)?.delete(handler);
  }),
  openURL: jest.fn(async (_url: string) => {}),
  canOpenURL: jest.fn(async (_url: string) => true),
  createURL: jest.fn((path: string) => `tutor-sg://${path}`),
  parse: jest.fn((url: string) => ({ path: url, queryParams: {} })),
  /** Helper for tests: simulate a deep link event */
  __simulateDeepLink: (url: string) => {
    const handlers = listeners.get('url');
    if (handlers) {
      handlers.forEach((handler) => handler({ url }));
    }
  },
  /** Helper for tests: reset all listeners */
  __resetListeners: () => listeners.clear(),
};

export default Linking;
