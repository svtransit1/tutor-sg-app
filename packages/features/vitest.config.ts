import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true, environment: 'node',
    include: ['**/__tests__/**/*.vitest.ts'],
    clearMocks: true,
    coverage: { provider: 'v8', include: ['src/**/*.ts'], exclude: ['src/**/*.types.ts', 'src/**/__tests__/**'] },
    testTimeout: 10000,
  },
});
