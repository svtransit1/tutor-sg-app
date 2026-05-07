<<<<<<< HEAD
const path = require('path');
const rnDir = path.dirname(require.resolve('react-native'));

module.exports = {
  preset: 'react-native',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: [
    '<rootDir>/src/home/',
    '<rootDir>/src/onboarding/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(-.*)?|@expo(-.*)?|react-native-.*)/',
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': path.join(
      rnDir,
      'jest',
      'assetFileTransformer.js',
    ),
  },
  moduleNameMapper: {
    '^uuid$': '<rootDir>/__mocks__/uuid.ts',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.ts',
    '^react-native-worklets$': '<rootDir>/__mocks__/react-native-worklets.ts',
    '^i18next$': '<rootDir>/__mocks__/i18next.ts',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.ts',
    '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.ts',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.ts',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.ts',
    '^expo-camera$': '<rootDir>/__mocks__/expo-camera.ts',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.ts',
    '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.ts',
    '^expo-(.*)$': '<rootDir>/__mocks__/expo-module-proxy.ts',
  },
  setupFiles: [path.join(rnDir, 'jest', 'setup.js')],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.types.ts',
    '!src/**/__tests__/**',
    '!src/i18n/**',
    '!src/onboarding/**',
    '!src/components/**',
    '!src/services/**',
  ],
  coverageThreshold: { global: { lines: 0, branches: 0, functions: 0 } },
  testTimeout: 30000,
=======
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
  },
>>>>>>> origin/feat/aaas-42-consent-privacy-current
};
