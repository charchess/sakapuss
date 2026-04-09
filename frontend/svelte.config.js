import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProd = process.env.NODE_ENV === 'production';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Use adapter-static in production for Docker/nginx deployment.
    // adapter-auto is used in development (vite dev server).
    adapter: isProd
      ? adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: 'index.html', // SPA mode: all routes fall back to index.html
          precompress: false,
        })
      : (await import('@sveltejs/adapter-auto')).default(),
  },
};

export default config;
