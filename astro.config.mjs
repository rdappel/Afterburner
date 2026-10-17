// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ryan-appel.com',
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      theme: 'vitesse-black',
      wrap: false,
    },
  },
});
