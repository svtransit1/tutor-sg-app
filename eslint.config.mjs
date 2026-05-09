import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/android/**",
      "**/ios/**",
      "**/.expo/**",
    ],
  },
  {
    files: [
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/*.test.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        beforeAll: "readonly",
        afterEach: "readonly",
        afterAll: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
  },
  {
    files: [
      "**/*.config.{js,mjs,cjs}",
      "babel.config.js",
      "metro.config.js",
      "eslint.config.mjs",
    ],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        crypto: "readonly",
        console: "readonly",
      },
    },
  },
];
