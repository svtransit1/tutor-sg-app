/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/device-tier',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  clearMocks: true,
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
}
