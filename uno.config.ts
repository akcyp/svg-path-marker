import presetWind3 from '@unocss/preset-wind3';
import transformerDirectives from '@unocss/transformer-directives';
import presetWebFonts from '@unocss/preset-web-fonts';
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';
import { defineConfig } from 'unocss';

export default defineConfig({
  presets: [
    presetWind3(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        mono: 'Input Mono',
        serif: 'PP Editorial New',
        fancy: 'Luxurious Script'
      },
      processors: createLocalFontProcessor({
        // Directory to cache the fonts
        cacheDir: 'node_modules/.cache/unocss/fonts',

        // Directory to save the fonts assets
        fontAssetsDir: 'public/assets/fonts',

        // Base URL to serve the fonts from the client
        fontServeBaseUrl: '/assets/fonts'
      })
    })
  ],
  transformers: [transformerDirectives()]
});
