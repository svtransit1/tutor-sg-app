/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/shared',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
}
