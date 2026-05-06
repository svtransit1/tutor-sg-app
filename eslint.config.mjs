// @ts-check

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/build/**',
      '**/.expo/**',
      '**/Pods/**',
      '**/.gradle/**',
      '**/__mocks__/**',

      // Generated / tooling outputs
      'mobile/expo-env.d.ts',
      '*.ipa',
      '*.apk',
      '*.aab',
      '*.app',

      // Model artefacts — never lint
      '**/models/**',
      '**/*.tflite',
      '**/*.litertlm',
      '**/*.gguf',

      // Test / coverage
      '**/coverage/**',
      '**/.nyc_output/**',
    ],
  },

  // ── Base JS + TypeScript recommended ───────────────────────────
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Language options (all files) ────────────────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
    rules: {
      // General
      'no-console': 'warn',
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
      'no-throw-literal': 'error',
      'object-shorthand': ['error', 'always'],
      'no-useless-rename': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },

  // ── React (.tsx / .jsx) ────────────────────────────────────────
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,

      'react/prop-types': 'off',
      'react/display-name': ['warn', { ignoreTranspilerName: false }],
      'react/no-unknown-property': 'error',
      'react/jsx-no-target-blank': 'error',
    },
  },

  // ── React Hooks ────────────────────────────────────────────────
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },

  // ── React Native (mobile workspace) ─────────────────────────────
  {
    files: ['mobile/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/sort-styles': 'off',
    },
  },

  // ── Node.js / CommonJS config files ────────────────────────────
  {
    files: ['**/*.config.{js,mjs,cjs}', '**/.eslintrc.{js,cjs}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },

  // ── Scripts ────────────────────────────────────────────────────
  {
    files: ['scripts/**/*.{ts,js}', '**/scripts/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
    },
  },

  // ── Test files ─────────────────────────────────────────────────
  {
    files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },

  // ── Prettier integration (must be last) ────────────────────────
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      ...prettierConfig.rules,
    },
  },
);
