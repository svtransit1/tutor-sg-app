/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/device-tier',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
}
