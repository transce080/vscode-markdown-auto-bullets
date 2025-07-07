import globals from "globals"
import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
      },

      ecmaVersion: 2022,
      sourceType: "module",
    }
  }]
