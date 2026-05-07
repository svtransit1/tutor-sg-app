// ── Module-level react-native mock ──────────────────────────────
// Intercept Node's require('react-native') at the CJS level,
// so that @testing-library/react-native and its transitive deps
// get our lightweight mock instead of the real RN (which uses Flow).
import { vi } from 'vitest';
import path from 'path';

const mockPath = path.resolve(__dirname, '__mocks__/react-native.cjs');
const Module = require('module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) {
  if (request === 'react-native') {
    return mockPath;
  }
  return origResolve.apply(this, [request, parent, ...args]);
};

// ── Global polyfills ────────────────────────────────────────────
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
