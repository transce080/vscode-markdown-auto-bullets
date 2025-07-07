import globals from "globals"
import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
      },
      sourceType: "module",
    }
  }]
