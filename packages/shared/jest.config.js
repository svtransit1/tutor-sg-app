/** @type {import('jest').Config} */
module.exports = {
  displayName: '@tutor-sg/shared',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.types.ts'],
  coverageThreshold: {
    global: { lines: 60 },
  },
};
