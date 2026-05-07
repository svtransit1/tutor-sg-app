import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/.expo/**", "**/__tests__/**", "**/__mocks__/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
