module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      require.resolve('ts-jest'),
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'commonjs',
          target: 'es2020',
          lib: ['es2020'],
          moduleResolution: 'node',
          strict: true,
          skipLibCheck: true,
          resolveJsonModule: true,
        },
        diagnostics: false,
      },
    ],
  },
};
