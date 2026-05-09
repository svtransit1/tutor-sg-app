const sharedConfig = require('../packages/eslint-config');

module.exports = [
  ...sharedConfig,
  {
    ignores: ['**/__mocks__/**', '**/coverage/**', '**/node_modules/**', '**/dist/**'],
  },
];
