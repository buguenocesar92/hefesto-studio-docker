import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hefesto-studio.cl',
  output: 'static',
  integrations: [react(), sitemap()],
  build: {
    format: 'directory',
  },
  compressHTML: false,
});
