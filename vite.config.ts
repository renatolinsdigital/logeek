/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const stylesPath = fileURLToPath(new URL('./src/styles', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    preprocessorOptions: {
      scss: { loadPaths: [stylesPath] },
    },
  },
  test: {
    // .claude/hooks has its own node:test suite (npm run test:hooks).
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    env: { TZ: 'America/Sao_Paulo' },
  },
});
