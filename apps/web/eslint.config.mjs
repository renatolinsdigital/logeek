import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import base from '../../eslint.config.mjs';

export default defineConfig([
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
