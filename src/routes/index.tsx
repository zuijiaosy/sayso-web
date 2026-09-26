import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Cpu, MousePointerClick, Moon, Keyboard } from 'lucide-react'

import { DataFlow } from '#/components/DataFlow'
import { GitHubIcon } from '#/components/Icons'
import { HeroDemo } from '#/components/demo/HeroDemo'
import { AppMock, goTo } from '#/components/mock/AppMock'
import { useOS } from '#/components/Platform'
import { Rich } from '#/components/Rich'
import { Rise } from '#/components/Reveal'
import { allFaqs } from '#/content/faq'
import { downloads, jsonLd, latest, pageHead, site } from '#/site'

const title = '顺口说 Sayso：本地优先的 macOS 语音输入，按住 Fn 说话，文字落在光标处'
const description =
  '顺口说是免费开源的语音输入工具。按住 Fn 说话，整理好的文字直接出现在光标处；按 Fn + 左 Shift 说中文，出来的是英文。本地离线识别，可选 DeepSeek 等文本模型整理，支持词典。'

export const Route = createFileRoute('/')({
  head: () => ({
    ...pageHead({ title, description, path: '/' }),
    scripts: [
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: '顺口说 Sayso',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: `macOS ${site.minMacOS}+, Windows`,
        softwareVersion: latest.version,
        license: 'https://opensource.org/licenses/MIT',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        description,
        url: site.url + '/',
        image: site.url + '/og.png',
        downloadUrl: downloads.mac,
      }),
    ],
  }),
  component: Home,
})

const providers: [string, string, string?][] = [
  ['Qwen3-ASR 0.6B', '本地识别', '推荐'],
  ['SenseVoice', '本地识别'],
  ['Whisper', '本地识别'],
  ['阶跃星辰 StepAudio', '云端识别'],
  ['阿里云百炼 Qwen-ASR', '云端识别'],
  ['智谱 GLM-ASR', '云端识别'],
  ['DeepSeek', '文本模型', '默认'],
  ['阿里云百炼', '文本模型'],
  ['OpenAI 兼容接口', '文本模型'],
  ['Apple Intelligence', '文本模型'],
]

const features = [
  {
    t: '按住 Fn，说完就上屏',
    d: '短按开始、再按结束，或者按住说、松开结束。文字直接落在光标所在的输入框，任何应用都能用。',
    art: (
      <div className="art-keys">
        <kbd>fn</kbd>
      </div>
    ),
  },
  {
    t: '说中文，出来是英文',
    d: 'Fn + 左 Shift 进入翻译。目标语言在悬浮条上随时切换，18 种语言可选；口述中途加上 Shift 也能转成翻译。',
    art: (
      <div className="art-bubbles">
        <span>下周一上线，请提前测一下</span>
        <span>Ships Monday — please test early.</span>
      </div>
    ),
  },
  {
    t: '不抢焦点的黑色胶囊',
    d: '录音时屏幕底部只有一个小胶囊：✕ 取消、实时波形、✓ 完成。你正在打字的窗口始终保持焦点。',
    art: (
      <div className="vl" style={{ animation: 'none' }}>
        <div className="vl-capsule">
          <span className="vl-icon-btn vl-cancel" />
          <div className="vl-wave mini-wave">
            {Array.from({ length: 11 }, (_, i) => (
              <i key={i} style={{ ['--k' as string]: i }} />
            ))}
          </div>
          <span className="vl-icon-btn vl-confirm" />
        </div>
      </div>
    ),
  },
  {
    t: '口头语自动去掉',
    d: '文本模型把「嗯、那个、就是」理顺成书面表达，不改变意思。也可以只纠错，或者完全关掉。',
    art: (
      <p className="art-strike">
        <s>嗯那个</s>我们明天<s>就是</s>三点开会
      </p>
    ),
  },
  {
    t: '专有名词一次教会',
    d: '把产品名、人名、术语和它们常被听错的样子写进词典。识别后按字面替换，翻译时用固定译法。',
    art: (
      <div className="art-dict">
        <span className="from">deep seek</span>
        <span className="arr">→</span>
        <span className="to">DeepSeek</span>
      </div>
    ),
  },
  {
    t: '本地或云端，自己选',
    d: '默认用 Qwen3-ASR 在本机离线识别，30 种语言自动判断语种。需要时再切到阶跃星辰、阿里云百炼或智谱的云端识别。',
    art: (
      <div className="art-route">
        <span className="on">本地识别</span>
        <span>云端识别</span>
      </div>
    ),
  },
]

const tryHints = [
  { icon: <Keyboard size={14} />, label: '改一个快捷键', go: { page: 'home' as const } },
  { icon: <Cpu size={14} />, label: '下载一个模型', go: { page: 'models' as const } },
  { icon: <BookOpen size={14} />, label: '往词典里加个词', go: { page: 'dictionary' as const } },
  { icon: <Moon size={14} />, label: '切到深色', go: { page: 'settings' as const, theme: 'dark' as const } },
]

const teaser = ['我的声音会上传吗？', '文本模型会拿到什么？', '不配置 API Key 能用吗？', '按 Fn 时会切换输入法或弹出表情面板']

function Home() {
  const os = useOS()
  const primary = os === 'win' ? downloads.win : downloads.mac
  const primaryLabel = os === 'win' ? '下载 Windows 版' : '下载 macOS 版'

  return (
    <main>
      <section className="hero wrap">
        <a className="pill" href={latest.url}>
          <span className="dot" />
          开源 · 本地优先 · v{latest.version} 已发布
          <ArrowRight size={14} />
        </a>
        <h1>
          <Rise text="顺口一说，" />
          <br />
          <Rise text="即刻上屏。" className="grad" />
        </h1>
        <p className="lead reveal" style={{ ['--d' as string]: '0.5s' }}>
          按住 <kbd>fn</kbd> 说话，整理好的文字直接落在光标处；按 <kbd>fn</kbd> + <kbd>左 ⇧</kbd> 说中文，出来的是英文。识别默认在本机离线完成。
        </p>
        <div className="cta reveal" style={{ ['--d' as string]: '0.65s' }}>
          <a href={primary} className="btn accent">
            {primaryLabel}
            <span className="ver">v{latest.version}</span>
          </a>
          <Link to="/" hash="try" className="btn ghost">
            <MousePointerClick size={16} />
            在线体验客户端
          </Link>
        </div>
        <p className="req reveal" style={{ ['--d' as string]: '0.75s' }}>
          macOS {site.minMacOS}+ Apple 芯片 · 另有 Windows x64 · MIT 许可证 · 基于 Handy
        </p>
        <div className="reveal" style={{ ['--d' as string]: '0.85s' }}>
          <HeroDemo />
        </div>
      </section>

      <div className="marquee reveal" aria-label="支持的识别和文本模型">
        <div className="marquee-track">
          {[...providers, ...providers].map(([name, kind, tag], i) => (
            <span className="chip" key={i} aria-hidden={i >= providers.length || undefined}>
              <b>{name}</b>
              {kind}
              {tag && <span className="tag">{tag}</span>}
            </span>
          ))}
        </div>
      </div>

      <section className="sec wrap" id="features">
        <div className="sec-head reveal">
          <span className="eyebrow">Features</span>
          <h2>说话的速度，打字的精度</h2>
          <p>口述、翻译、整理、词典，都围绕一件事：你说完，光标处就是能直接发出去的文字。</p>
        </div>
        <div className="features">
          {features.map((f, i) => (
            <article className="feature reveal" key={f.t} style={{ ['--d' as string]: `${(i % 3) * 90}ms` }}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <div className="art">{f.art}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec wrap" id="try">
        <div className="sec-head reveal">
          <span className="eyebrow">Try it</span>
          <h2>不用安装，先在网页上点一点</h2>
          <p>下面就是顺口说的主窗口，按客户端的界面一比一重建。切页面、拨开关、改快捷键、下载模型、加词条，都能直接操作。</p>
        </div>
        <div className="try-hints reveal">
          {tryHints.map((h) => (
            <button
              key={h.label}
              type="button"
              className="pill"
              onClick={() => {
                goTo(h.go)
                document.getElementById('app-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              {h.icon}
              {h.label}
            </button>
          ))}
        </div>
        <div className="stage reveal" id="app-stage">
          <AppMock />
        </div>
      </section>

      <section className="sec wrap" id="privacy">
        <div className="sec-head reveal">
          <span className="eyebrow">Privacy</span>
          <h2>你的声音和文字去了哪儿</h2>
          <p>三种常见配置，哪些数据会离开你的电脑，一眼看清。橙色的线表示穿过了网络边界。</p>
        </div>
        <div className="reveal">
          <DataFlow />
        </div>
      </section>

      <section className="sec wrap" id="oss">
        <div className="sec-head reveal">
          <span className="eyebrow">Open source</span>
          <h2>开源，也打算一直开源</h2>
        </div>
        <div className="oss">
          <div className="oss-card reveal">
            <h3>站在 Handy 的肩膀上</h3>
            <p>顺口说从开源项目 Handy（MIT）分叉。录音、全局热键、不抢焦点的悬浮窗、可靠粘贴和模型管理沿用上游；翻译模式、文本模型整理、词典和云端识别是新加的。</p>
            <ul>
              <li>Tauri 2 + Rust 后端，React 前端</li>
              <li>本地识别不联网，失败时不会悄悄改用云端</li>
              <li>每次发版，官网和下载链接自动更新到最新版本</li>
            </ul>
            <div className="row">
              <a className="btn" href={site.sourceUrl}>
                <GitHubIcon size={16} />
                查看源代码
              </a>
              <a className="btn ghost" href={site.upstreamUrl}>
                Handy 上游
              </a>
            </div>
          </div>
          <pre className="term reveal" style={{ ['--d' as string]: '100ms' }}>
            <div className="bar">
              <i />
              <i />
              <i />
            </div>
            <span className="c"># 克隆并在本地运行</span>
            {'\n'}
            <span className="p">$ </span>git clone {site.sourceUrl}.git{'\n'}
            <span className="p">$ </span>cd sayso && bun install{'\n'}
            <span className="p">$ </span>bun run tauri dev{'\n\n'}
            <span className="c"># 下载安装包后去掉隔离属性</span>
            {'\n'}
            <span className="p">$ </span>xattr -cr /Applications/Sayso.app
          </pre>
        </div>
      </section>

      <section className="sec wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">FAQ</span>
          <h2>常见问题</h2>
        </div>
        <div className="qa">
          {allFaqs
            .filter((f) => teaser.includes(f.q))
            .map((f, i) => (
              <details key={f.q} className="reveal" style={{ ['--d' as string]: `${i * 60}ms` }}>
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
        <p className="center">
          <Link to="/faq" className="more-link">
            全部问题 →
          </Link>
        </p>
      </section>

      <div className="wrap">
        <section className="get reveal">
          <img src="/mark.svg" alt="" width="88" height="88" />
          <h2>现在就顺口说一句</h2>
          <p>免费、开源、本地优先。v{latest.version}，适用于 macOS {site.minMacOS} 及以上。</p>
          <div className="cta">
            <a href={primary} className="btn">
              {primaryLabel}
            </a>
            <Link to="/download" className="btn ghost">
              全部下载方式
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
