import { Link, createFileRoute } from '@tanstack/react-router'
import { Apple, MonitorDown } from 'lucide-react'

import { useOS } from '#/components/Platform'
import { downloads, latest, mb, pageHead, site } from '#/site'

export const Route = createFileRoute('/download')({
  head: () =>
    pageHead({
      title: `下载顺口说 v${latest.version} · macOS 语音输入`,
      description: `下载顺口说 Sayso 最新版 v${latest.version}：Apple 芯片 Mac 的 .dmg 和 Windows x64 安装包。免费开源，附安装步骤和首次授权说明。`,
      path: '/download',
    }),
  component: Download,
})

const date = new Date(latest.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

function Download() {
  const os = useOS()
  return (
    <main className="wrap page narrow">
      <div className="reveal">
        <span className="pill">
          <span className="dot" />v{latest.version} · {date} 发布
        </span>
        <h1 style={{ marginTop: 18 }}>下载顺口说</h1>
        <p className="lead">免费，MIT 许可证开源。下载按钮指向 GitHub 上最新发布的安装包。</p>
      </div>

      <div className="dl-grid">
        <div className={'dl-card reveal' + (os === 'mac' ? ' suggested' : '')}>
          {os === 'mac' && <span className="badge">推荐</span>}
          <h2>
            <Apple size={22} /> macOS
          </h2>
          <p className="meta">
            Apple 芯片（M1 及以上）· macOS {site.minMacOS}+ · {mb(latest.mac?.size)}
          </p>
          <div className="row">
            <a className="btn accent" href={downloads.mac}>
              下载 .dmg
            </a>
          </div>
        </div>
        <div className={'dl-card reveal' + (os === 'win' ? ' suggested' : '')} style={{ ['--d' as string]: '80ms' }}>
          {os === 'win' && <span className="badge">推荐</span>}
          <h2>
            <MonitorDown size={22} /> Windows
          </h2>
          <p className="meta">x64 · {mb(latest.winExe?.size)} · 沿用上游 Handy 的能力，Fn 相关功能仅限 macOS</p>
          <div className="row">
            <a className={'btn' + (os === 'win' ? ' accent' : ' ghost')} href={downloads.win}>
              下载 -setup.exe
            </a>
            <a className="btn ghost" href={downloads.winMsi}>
              .msi
            </a>
          </div>
        </div>
      </div>
      <p className="note">
        也可以在 <a href={latest.url}>GitHub 发布页</a> 查看这个版本的更新说明，或浏览<a href={`${site.sourceUrl}/releases`}>全部版本</a>。
      </p>

      <section className="steps reveal">
        <h2>macOS 安装</h2>
        <ol>
          <li>打开下载的 .dmg，把 Sayso.app 拖进「应用程序」。</li>
          <li>
            安装包没有经过 Apple 公证。确认下载来自本仓库后，在终端运行 <code>xattr -cr /Applications/Sayso.app</code>，再打开。
          </li>
          <li>按提示授予麦克风、辅助功能和输入监控三项权限。</li>
          <li>打开「系统设置 → 键盘」，把「按下 🌐 键时」改成「不执行任何操作」，否则按 Fn 时会同时切换输入法。</li>
          <li>选择识别方式：下载 Qwen3-ASR 0.6B（约 811 MB）、导入已有的 SenseVoice 文件夹，或者使用云端识别。</li>
          <li>需要整理或翻译时，在「模型 → 文本模型」里填好 API Key，点「测试」。</li>
        </ol>
      </section>

      <section className="steps reveal">
        <h2>Windows 安装</h2>
        <ol>
          <li>运行 -setup.exe 或 .msi 安装包。</li>
          <li>安装包没有 Authenticode 签名，首次运行 SmartScreen 会拦截，点「更多信息」→「仍要运行」。</li>
        </ol>
      </section>

      <section className="steps reveal">
        <h2>从 Voiceless 升级</h2>
        <p style={{ color: 'var(--ink-2)' }}>
          首次启动时会把 <code>com.voiceless.desktop</code> 里的设置、历史、录音和已下载的模型整体搬到 <code>com.sayso.desktop</code>，模型不用重新下载。macOS 的权限跟应用身份绑定，需要重新授权一次。
        </p>
      </section>

      <section className="steps reveal">
        <h2>从源代码构建</h2>
        <pre className="term">
          <div className="bar">
            <i />
            <i />
            <i />
          </div>
          <code style={{ background: 'none', border: 0, padding: 0, color: 'inherit' }}>
            <span className="c"># 需要 Rust（stable）和 Bun</span>
            {'\n'}
            <span className="p">$ </span>git clone {site.sourceUrl}.git && cd sayso{'\n'}
            <span className="p">$ </span>bun install{'\n'}
            <span className="p">$ </span>mkdir -p src-tauri/resources/models{'\n'}
            <span className="p">$ </span>curl -o src-tauri/resources/models/silero_vad_v4.onnx https://blob.handy.computer/silero_vad_v4.onnx{'\n'}
            <span className="p">$ </span>bun run tauri dev
          </code>
        </pre>
        <p className="note">
          完整的构建说明见仓库里的 <a href={`${site.sourceUrl}/blob/main/BUILD.md`}>BUILD.md</a>。安装和权限的其他问题见<Link to="/faq">常见问题</Link>。
        </p>
      </section>
    </main>
  )
}
