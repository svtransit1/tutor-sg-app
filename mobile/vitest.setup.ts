/**
 * Vitest setup — global mocks for Expo SDK and React Native.
 */

import { vi } from 'vitest';

// Set Expo env vars
process.env.EXPO_OS = 'ios';

// Mock expo global — required by expo-modules-core
globalThis.expo = {
  EventEmitter: class EventEmitter {
    constructor() {}
    addListener() {}
    removeListener() {}
    emit() {}
  },
};

// Mock __DEV__ global
globalThis.__DEV__ = true;

// Mock requestAnimationFrame for React
globalThis.requestAnimationFrame = (cb: () => void) => {
  return setTimeout(cb, 0) as unknown as number;
};
globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock ResizeObserver — required by some RN components
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock expo-secure-store globally
const secureStoreData = new Map<string, string>();

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStoreData.set(key, value);
  }),
  getItemAsync: vi.fn(async (key: string) => {
    return secureStoreData.get(key) ?? null;
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStoreData.delete(key);
  }),
}));

// Expose the store map for test cleanup
(globalThis as any).__SECURE_STORE_MOCK__ = secureStoreData;
