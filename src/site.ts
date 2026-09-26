// Site-wide settings.
import release from './generated/release.json'

const repo = 'https://github.com/zuijiaosy/sayso'

type Asset = { name: string; url: string; size: number } | null

export const latest = release as {
  version: string
  tag: string
  publishedAt: string
  url: string
  mac: Asset
  winExe: Asset
  winMsi: Asset
}

export const site = {
  name: '顺口说 Sayso',
  // Absolute origin used for canonical links, Open Graph and the sitemap.
  url: ((import.meta.env.VITE_SITE_URL as string | undefined) || 'https://sayso-8j4.pages.dev').replace(/\/$/, ''),
  minMacOS: '13',
  sourceUrl: repo,
  releasesUrl: `${repo}/releases/latest`,
  upstreamUrl: 'https://github.com/cjpais/Handy',
}

/** Direct installer links from the latest release, or the releases page when missing. */
export const downloads = {
  mac: latest.mac?.url ?? site.releasesUrl,
  win: latest.winExe?.url ?? site.releasesUrl,
  winMsi: latest.winMsi?.url ?? site.releasesUrl,
}

export const mb = (bytes?: number) => (bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '')

type HeadInput = { title: string; description: string; path: string; image?: string }

export function pageHead({ title, description, path, image = '/og.png' }: HeadInput) {
  const url = site.url + path
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: site.url + image },
      { property: 'og:locale', content: 'zh_CN' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

export function jsonLd(data: object) {
  return { type: 'application/ld+json', children: JSON.stringify(data) }
}
