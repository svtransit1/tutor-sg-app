module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
    '^react-native-device-info$': '<rootDir>/__mocks__/react-native-device-info.ts',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.ts',
    '^@tutor-sg/shared$': '<rootDir>/../packages/shared/src/index.ts',
  },
};
