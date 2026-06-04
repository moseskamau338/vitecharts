import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      // Two entries: the zero-config main and the tree-shakeable `lean`.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        lean: resolve(__dirname, 'src/lean.ts'),
      },
    },
    sourcemap: true,
    rollupOptions: {
      // Keep d3 modules external so the lib stays small and dedupes across charts.
      external: [/^d3-/],
      // Two outputs (ESM + CJS), each preserving the source module graph so a
      // consumer's bundler can tree-shake unregistered chart types from `/lean`.
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
        {
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
      // Emit a `.d.cts` next to each entry's `.d.ts` for the CJS require condition.
      afterBuild: () => {
        const dir = resolve(__dirname, 'dist');
        for (const name of ['index', 'lean']) {
          const dts = resolve(dir, `${name}.d.ts`);
          if (existsSync(dts)) copyFileSync(dts, resolve(dir, `${name}.d.cts`));
        }
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
