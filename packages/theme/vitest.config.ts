// Vitest config for @tutor-sg/theme.
// Design tokens are pure functions; ThemeProvider tests mock RN.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.vitest.(ts|tsx|js)'],
    exclude: ['**/node_modules/**', '**/__tests__/setup.vitest.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.(ts|tsx)'],
      exclude: ['src/**/__tests__/**'],
    },
    testTimeout: 10000,
    deps: {
      inline: ['react-native'],
    },
  },
});
