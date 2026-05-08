const path = require('path');
const rnDir = path.dirname(require.resolve('react-native'));

module.exports = {
  preset: 'react-native',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['<rootDir>/src/home/'],
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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.ts',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.ts',
    '^i18next$': '<rootDir>/__mocks__/i18next.ts',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.ts',
  },
  setupFiles: [path.join(rnDir, 'jest', 'setup.js')],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  clearMocks: true,
  collectCoverage: false,
  testTimeout: 30000,
};
