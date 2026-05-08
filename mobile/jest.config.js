module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(js|ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.json',
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.ts',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.ts',
    '^i18next$': '<rootDir>/__mocks__/i18next.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  clearMocks: true,
  collectCoverage: false,
  testTimeout: 30000,
};
