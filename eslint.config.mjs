import eslint from "@eslint/js";

export default [
  eslint.configs.recommended,
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/__mocks__/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs", "**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
];
