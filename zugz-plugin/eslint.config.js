import js from "@eslint/js";
import html from "eslint-plugin-html";

export default [
  js.configs.recommended,
  {
    plugins: {
      html
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
