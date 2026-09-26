// Writes sitemap.xml and robots.txt for the prerendered site.
import fs from 'node:fs'
import path from 'node:path'

const host = (process.env.VITE_SITE_URL || 'https://sayso-app.pages.dev').replace(/\/$/, '')
const out = path.resolve('dist/client')
const pages = ['/', '/download', '/faq']
const today = new Date().toISOString().slice(0, 10)

for (const p of pages) {
  const file = path.join(out, p === '/' ? 'index.html' : `${p.slice(1)}.html`)
  if (!fs.existsSync(file)) throw new Error(`missing prerendered page ${file}`)
}

const urls = pages.map((p) => `  <url><loc>${host}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')
fs.writeFileSync(
  path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`)
fs.rmSync(path.join(out, 'pages.json'), { force: true })
console.log(`sitemap.xml and robots.txt written for ${host}`)
