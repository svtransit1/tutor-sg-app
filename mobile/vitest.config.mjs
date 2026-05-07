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
    // Inline react-native so Vite processes it through its transform pipeline
    // (which respects resolve.alias below) instead of leaving it as an external
    // that Node.js tries to parse via its CJS→ESM bridge. The real react-native
    // ships Flow syntax (`import typeof`) that cannot be parsed by Node 25's ESM
    // parser or Vite's Rolldown bundler.
    deps: {
      inline: ['react-native'],
      fallbackCJS: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-native': path.resolve(__dirname, '__mocks__/react-native.cjs'),
    },
  },
});
