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

// ── Intercept Node.js CJS require('react-native') → CJS mock ──
// RNTL's build output uses CJS require('react-native') internally. In a
// "type": "module" workspace, Node's CJS→ESM bridge tries to parse the real
// react-native as ESM and fails on its Flow syntax (`import typeof`).
// This hook maps the specifier to our CJS mock before Node sees the file.
import Module from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rnMockPath = path.resolve(__dirname, '__mocks__/react-native.cjs');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === 'react-native') {
    return rnMockPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
