import js from "@eslint/js"
import globals from "globals"
import { defineConfig } from "eslint/config"


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" }
  },
  {
    ignores: [".vscode-test", "build", "node_modules"]
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha
      }
    }
  }
])
