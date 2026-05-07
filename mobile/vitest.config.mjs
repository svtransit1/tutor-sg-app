import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.vitest.(ts|tsx|js)'],
    setupFiles: ['./setup-jest.vitest.ts'],
    clearMocks: true,
    coverage: { provider: 'v8', include: ['src/**/*.(ts|tsx)'], exclude: ['src/**/*.types.ts', 'src/**/__tests__/**', 'src/i18n/**', 'src/components/**', 'src/services/**'], thresholds: { lines: 0, branches: 0, functions: 0 } },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-native': path.resolve(__dirname, '__mocks__/react-native.cjs'),
    },
  },
});
