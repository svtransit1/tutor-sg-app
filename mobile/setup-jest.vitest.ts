// ── Global polyfills for Vitest + React Native Testing Library ──
import { vi } from 'vitest';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

Object.defineProperties(globalThis, {
  __DEV__: { configurable: true, value: true, writable: true },
  cancelAnimationFrame: { configurable: true, value(id: number) { return clearTimeout(id); }, writable: true },
  nativeFabricUIManager: { configurable: true, value: {}, writable: true },
  performance: { configurable: true, value: { now: vi.fn(Date.now) }, writable: true },
  requestAnimationFrame: { configurable: true, value(cb: (t: number) => void) { return setTimeout(() => cb(Date.now()), 0); }, writable: true },
  window: { configurable: true, value: globalThis, writable: true },
});
(globalThis as any).nativeRuntimeScheduler = {};
