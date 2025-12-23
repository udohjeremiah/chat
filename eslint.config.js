import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import eslintPluginSonarjs from "eslint-plugin-sonarjs";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { importX } from "eslint-plugin-import-x";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config[]} */
export default [
  globalIgnores(["node_modules/**", "dist/**", "**/routeTree.gen.ts"]),
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
            props: false,
          },
        },
      ],
    },
  },
  {
    files: ["web/**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser.parseForESLint(),
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: { "react-hooks": eslintPluginReactHooks },
  },
];
