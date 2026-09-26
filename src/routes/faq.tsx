import { Link, createFileRoute } from '@tanstack/react-router'

import { Rich } from '#/components/Rich'
import { faqGroups } from '#/content/faq'
import { jsonLd, pageHead } from '#/site'

const strip = (s: string) => s.replace(/\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*/g, (_m, a, b, c) => a ?? b ?? c)

export const Route = createFileRoute('/faq')({
  head: () => ({
    ...pageHead({
      title: '常见问题 · 顺口说 Sayso',
      description: '顺口说的安装、权限、隐私、识别模型、文本模型和快捷键相关的常见问题。',
      path: '/faq',
    }),
    scripts: [
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqGroups.flatMap((g) =>
          g.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.map(strip).join('\n') } })),
        ),
      }),
    ],
  }),
  component: FaqPage,
})

function FaqPage() {
  return (
    <main className="wrap page">
      <div className="sec-head reveal" style={{ marginBottom: 0 }}>
        <span className="eyebrow">FAQ</span>
        <h1 style={{ marginTop: 12 }}>常见问题</h1>
        <p className="lead">没找到答案？到 GitHub 提一个 issue。</p>
      </div>
      {faqGroups.map((g) => (
        <section key={g.title}>
          <h2 className="qa-group reveal">{g.title}</h2>
          <div className="qa">
            {g.items.map((f, i) => (
              <details key={f.q} className="reveal" style={{ ['--d' as string]: `${i * 40}ms` }}>
                <summary>{f.q}</summary>
                <div className="a">
                  {f.a.map((p) => (
                    <p key={p}>
                      <Rich text={p} />
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="center" style={{ marginTop: 40 }}>
        <Link to="/download" className="btn accent">
          下载顺口说
        </Link>
      </p>
    </main>
  )
}
