// vite.config.ts
import { sveltekit }   from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  // ensure imported images/fonts/etc are also inlined
  build: {
    assetsInlineLimit: Infinity
  }
});
