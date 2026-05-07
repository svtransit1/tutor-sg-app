import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    deps: {
      inline: [],
    },
  },
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, '__mocks__/react-native.js'),
    },
  },
  define: {
    __DEV__: true,
  },
});
