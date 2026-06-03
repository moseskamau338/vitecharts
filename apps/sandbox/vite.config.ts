import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // Use the core source directly during dev for instant HMR (no build step).
      '@vitecharts/core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
});
