import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

// The site is fully static: every route is prerendered to HTML in dist/client,
// and Cloudflare serves that folder as static assets (see wrangler.jsonc).
// sitemap.xml and robots.txt are written by scripts/postbuild.mjs.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, failOnError: true, autoSubfolderIndex: false },
      pages: [{ path: '/404', prerender: { enabled: true, outputPath: '/404.html' } }],
    }),
    viteReact(),
  ],
})
