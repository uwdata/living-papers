import js from '@eslint/js';
import globals from 'globals';

/** @type {import('@types/eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.mocha,
        ...globals.node,
        ...globals.es6,
        globalThis: false
      }
    },
    rules: {
      'no-unexpected-multiline': 'off'
    }
  }
];
