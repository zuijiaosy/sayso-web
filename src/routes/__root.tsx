import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'

import appCss from '../styles.css?url'
import mockCss from '../mock.css?url'
import { GitHubIcon } from '#/components/Icons'
import { useReveal } from '#/components/Reveal'
import { latest, site } from '#/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fbfaf7', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#1a1917', media: '(prefers-color-scheme: dark)' },
      { title: '顺口说 Sayso' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: mockCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/mark.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
  component: Layout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const nav = [
  { to: '/', label: '首页', hash: undefined },
  { to: '/', label: '在线体验', hash: 'try' },
  { to: '/faq', label: '常见问题', hash: undefined },
  { to: '/download', label: '下载', hash: undefined },
] as const

function Layout() {
  useReveal()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <>
      <div className="ambient" aria-hidden="true">
        <i />
        <i />
      </div>
      <header className={'nav' + (scrolled ? ' scrolled' : '')}>
        <div className="nav-pill">
          <Link to="/" className="brand">
            <img src="/mark.svg" alt="" width="26" height="26" />
            顺口说
          </Link>
          <nav className="nav-links" aria-label="主导航">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} hash={n.hash} activeOptions={{ exact: true, includeHash: true }} activeProps={n.hash ? {} : { 'aria-current': 'page' }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <a className="gh-icon" href={site.sourceUrl} aria-label="GitHub 源代码">
            <GitHubIcon />
          </a>
        </div>
      </header>
      <Outlet />
      <footer className="foot">
        <div className="wrap foot-in">
          <div className="foot-brand">
            <img src="/mark.svg" alt="" width="22" height="22" />
            <span>
              顺口说 Sayso v{latest.version} · MIT 许可证开源 · 基于 <a href={site.upstreamUrl}>Handy</a>
            </span>
          </div>
          <nav aria-label="页脚">
            <Link to="/" hash="try">
              在线体验
            </Link>
            <Link to="/faq">常见问题</Link>
            <Link to="/download">下载</Link>
            <a href={site.sourceUrl}>源代码</a>
            <a href={`${site.sourceUrl}/releases`}>更新记录</a>
          </nav>
        </div>
      </footer>
    </>
  )
}

function NotFound() {
  return (
    <main className="wrap page narrow">
      <h1>找不到这个页面</h1>
      <p className="lead">链接可能写错了，或者页面已经移动。</p>
      <p style={{ marginTop: 20 }}>
        <Link to="/">回到首页</Link> · <Link to="/faq">常见问题</Link>
      </p>
    </main>
  )
}
