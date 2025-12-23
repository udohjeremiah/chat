import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import eslintPluginSonarjs from "eslint-plugin-sonarjs";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { importX } from "eslint-plugin-import-x";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  eslintPluginSonarjs.configs.recommended,
  importX.flatConfigs.recommended,
  {
    rules: {
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            env: false,
          },
        },
      ],
    },
  },
  {
    files: ["web/**/*.{js,ts,jsx,tsx}"],
    plugins: { "react-hooks": eslintPluginReactHooks },
  },
  {
    ignores: ["node_modules/**", "dist/**"],
  },
];
