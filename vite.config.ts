import { defineConfig, type UserConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import eslint from 'vite-plugin-eslint2';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import vitePluginPaths from 'vite-tsconfig-paths';

const libraryOptions: UserConfig = {
  publicDir: false,
  build: {
    lib: {
      name: 'svg-path-marker',
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
      fileName: 'index'
    }
  }
};

const staticPageOptions: UserConfig = {
  base: '/svg-path-marker/',
  build: {
    outDir: 'build'
  }
};

export default defineConfig(({ mode }) => ({
  plugins: [
    UnoCSS(),
    eslint(),
    vitePluginPaths(),
    mode !== 'build:ci' &&
      dts({
        include: ['lib'],
        rollupTypes: true,
        tsconfigPath: './tsconfig.app.json'
      })
  ],
  ...(mode === 'build:ci' ? staticPageOptions : libraryOptions)
}));
