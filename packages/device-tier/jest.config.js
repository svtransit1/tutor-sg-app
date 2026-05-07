/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/device-tier',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^@tutor-sg/(.*)$': '<rootDir>/../$1/src',
  },
  clearMocks: true,
};
