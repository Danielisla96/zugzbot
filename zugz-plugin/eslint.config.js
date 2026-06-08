import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: [".opencode/**", "node_modules/**", "dist/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        Buffer: "readonly",
        process: "readonly",
        fetch: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "caughtErrors": "none" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-empty": "off",
      "no-undef": "error",
      "no-console": "off"
    }
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "caughtErrors": "none" }],
      "no-console": "off",
      "no-undef": "error"
    }
  }
];