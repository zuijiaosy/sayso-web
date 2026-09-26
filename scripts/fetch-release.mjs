// Writes src/generated/release.json from the latest GitHub release of the app,
// so every build links straight to the newest installers. When the API is
// unreachable (offline, rate limited) the committed file is kept as is, and the
// buttons still work because they fall back to the releases page.
import fs from 'node:fs'
import path from 'node:path'

const repo = process.env.SAYSO_REPO ?? 'zuijiaosy/sayso'
const out = path.resolve('src/generated/release.json')

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'sayso-web' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const pick = (assets, re) => {
  const a = assets.find((x) => re.test(x.name))
  return a ? { name: a.name, url: a.browser_download_url, size: a.size } : null
}

try {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const r = await res.json()
  const release = {
    version: r.tag_name.replace(/^v/, ''),
    tag: r.tag_name,
    publishedAt: r.published_at,
    url: r.html_url,
    mac: pick(r.assets, /aarch64\.dmg$/i),
    winExe: pick(r.assets, /-setup\.exe$/i),
    winMsi: pick(r.assets, /\.msi$/i),
  }
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(release, null, 2) + '\n')
  console.log(`release.json → ${release.tag} (${release.publishedAt})`)
} catch (err) {
  if (!fs.existsSync(out)) throw err
  console.warn(`fetch-release: ${err.message}; keeping the committed release.json`)
}
