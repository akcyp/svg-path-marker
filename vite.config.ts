import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import eslint from 'vite-plugin-eslint2';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import vitePluginPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    UnoCSS(),
    eslint(),
    vitePluginPaths(),
    dts({
      include: ['lib'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  build: {
    lib: {
      name: 'svg-editor',
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
      fileName: 'index'
    }
  }
});
