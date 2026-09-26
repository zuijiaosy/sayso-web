import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
  head: () => ({ meta: [{ title: '找不到页面 · 顺口说' }, { name: 'robots', content: 'noindex' }] }),
  component: () => (
    <main className="wrap page narrow">
      <h1>找不到这个页面</h1>
      <p className="lead">链接可能写错了，或者页面已经移动。</p>
      <p style={{ marginTop: 20 }}>
        <Link to="/">回到首页</Link> · <Link to="/faq">常见问题</Link>
      </p>
    </main>
  ),
})
