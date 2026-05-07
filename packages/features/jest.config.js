/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/features',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  clearMocks: true,
}
