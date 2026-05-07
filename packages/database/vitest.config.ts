import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: { globals: true, include: ['src/__tests__/**/*.test.ts'], environment: 'node' },
  resolve: { alias: { 'expo-sqlite': new URL('src/__tests__/__mocks__/expo-sqlite.ts', import.meta.url).pathname } },
})
