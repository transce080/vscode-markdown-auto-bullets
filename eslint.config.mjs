import globals from "globals"
import js from "@eslint/js"

export default [
  js.configs.all,
  {
    ignores: [
      ".vscode-test/**",
      ".vscode/**",
      "node_modules/**"
    ]
  },
  {
    files: ["**/*.js", "!**/*.test.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
      },
      sourceType: "module",
    },
    rules: {
      "curly": ["off"],
      "eqeqeq": ["off"],
      "func-style": ["off"],
      "max-params": ["warn"],
      "max-statements": ["warn"],
      "no-console": ["off"],
      "no-implicit-coercion": ["warn"],
      "no-inline-comments": ["off"],
      "no-magic-numbers": ["error", { "ignore": [-1, 0, 1] }],
      "no-negated-condition": ["warn"],
      "no-promise-executor-return": ["warn"],
      "no-ternary": ["off"],
      "no-underscore-dangle": ["off"],
      "no-use-before-define": ["off"],
      "no-warning-comments": ["warn"],
      "one-var": ["off"],
      "prefer-named-capture-group": ["off"],
    },
  },
  {
    files: ["**/*.test.js"],
    rules: {
      "max-lines-per-function": ["off"],
      "max-params": ["off"],
      "max-statements": ["off"],
      "no-magic-numbers": ["off"],
    }
  }
]
