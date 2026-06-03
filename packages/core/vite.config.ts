import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ViteCharts',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      // Keep d3 modules external so the lib stays small and dedupes across charts.
      external: [/^d3-/],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
      // The rolled-up types are identical for both module systems; emit a
      // `.d.cts` so the CJS `require` condition resolves types correctly.
      afterBuild: () => {
        const dir = resolve(__dirname, 'dist');
        copyFileSync(resolve(dir, 'index.d.ts'), resolve(dir, 'index.d.cts'));
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
