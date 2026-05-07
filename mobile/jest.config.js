const path = require('path');
const rnDir = path.dirname(require.resolve('react-native'));

module.exports = {
  preset: 'react-native',
  rootDir: '.',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: [],
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
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.ts',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.tsx',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.ts',
    '^expo-(.*)$': '<rootDir>/__mocks__/expo-module-proxy.ts',
  },
  setupFiles: [path.join(rnDir, 'jest', 'setup.js')],
  setupFilesAfterEnv: [],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.types.ts',
    '!src/**/__tests__/**',
    '!src/i18n/**',
    '!src/components/**',
    '!src/services/**',
  ],
  coverageThreshold: { global: { lines: 0, branches: 0, functions: 0 } },
  testTimeout: 30000,
};
