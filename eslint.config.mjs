// The shared base. apps/web has its own eslint.config.mjs that spreads this
// one and adds the React plugins; ESLint 10 uses the config nearest to each
// file it lints.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // .claude is the dev-boilerplate kit, checked by its own tests (npm run test:hooks).
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '.claude/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Root config files run on Node.
    files: ['*.mjs'],
    languageOptions: { globals: globals.node },
  },
]);
