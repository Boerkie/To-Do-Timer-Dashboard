// svelte.config.js
import adapter    from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess(),
  kit: {
    adapter: adapter({
      pages:    'build',
      assets:   'build',
      fallback: 'index.html'
    }),
    // Remove this line entirely:
    // ssr: false,
    output: { bundleStrategy: 'inline' },
    router: { type: 'hash' }
  }
};
