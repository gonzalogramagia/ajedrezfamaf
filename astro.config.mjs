import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  site: 'https://ajedrezfamaf.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  markdown: {
    shikiConfig: {
      theme: 'nord',
      wrap: true
    }
  }
});
