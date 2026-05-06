import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactNativePlugin from "eslint-plugin-react-native";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "node_modules/",
      "**/node_modules/",
      ".expo/",
      "dist/",
      "dist-*/",
      "build/",
      "coverage/",
      "**/*.config.*",
      "**/babel.config.*",
      "**/metro.config.*",
      "**/jest.config.*",
      "**/__mocks__/**",
      "**/setup-jest.*",
      "**/__tests__/**",
      "**/*.js",
    ],
  },
  {
    files: ["mobile/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    ignores: ["**/__tests__/**", "**/setup-jest.*"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-native": reactNativePlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "off",
      "react-native/no-color-literals": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
);
