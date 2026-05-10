import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**',
      '**/.expo/**', '**/android/**', '**/ios/**',
      '**/*.config.*', '**/babel.config.*', '**/metro.config.*', '**/jest.config.*',
      '**/src/components/**',
      '**/src/services/**', '**/src/storage/**', '**/src/screens/**',
      '**/src/hooks/**', '**/src/onboarding/**', '**/src/parent-auth/**',
      '**/src/i18n/**', '**/src/types/**', '**/src/db/**', '**/src/models/**',
      '**/src/__tests__/**', '**/modules/**',
      '**/app/auth/callback.tsx',
      '**/app/(onboarding)/**',
      '**/app/(kid)/camera.tsx', '**/app/(kid)/homework-feedback.tsx',
      '**/app/(parent)/pin-setup.tsx', '**/app/(parent)/pin-verify.tsx',
      '**/app/(parent)/change-pin.tsx', '**/app/(parent)/index.tsx',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

