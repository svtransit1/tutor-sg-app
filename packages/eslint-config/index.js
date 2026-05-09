const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier/flat');

const SOURCE_FILES = ['src/**/*.ts', 'src/**/*.tsx', 'app/**/*.ts', 'app/**/*.tsx'];
const TEST_FILES = ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/__mocks__/**/*.{ts,tsx}'];

module.exports = [
  // Source: type-checked recommended + custom rules
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: SOURCE_FILES })),
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({ ...c, files: SOURCE_FILES })),
  {
    name: '@tutor-sg/typescript',
    files: SOURCE_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Test: non-type-checked recommended only
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: TEST_FILES })),

  // Prettier: disable conflicting rules for all files
  {
    name: '@tutor-sg/prettier',
    rules: prettierConfig.rules,
  },
];
