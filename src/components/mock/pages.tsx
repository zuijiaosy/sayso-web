// The six pages of the client, rebuilt against mock state. Layout, wording and
// control types follow src/voiceless/pages/*.tsx; anything that would touch the
// system (downloads, API tests, permissions) is simulated.
import { AudioLines, Copy, FolderOpen, Info, Plus, RefreshCw, RotateCcw, Search, Shield, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  CLOUD_VENDORS,
  DEFAULT_BINDINGS,
  HISTORY,
  LOCAL_MODELS,
  TEXT_PROVIDERS,
  TRANSLATE_TARGETS,
  languageLabel,
  levelFor,
  usageGrid,
  type Activation,
  type CloudVendor,
  type HistoryItem,
  type MockState,
  type PostMode,
  type Theme,
} from './state'
import { Btn, Chip, Page, Row, Section, Segmented, StatusPill, Switch, TabbedSection } from './ui'
import { latest } from '#/site'

export type Ctx = {
  state: MockState
  set: <K extends keyof MockState>(key: K, value: MockState[K]) => void
  setState: (fn: (s: MockState) => MockState) => void
  toast: (msg: string, err?: boolean) => void
}

const nf = new Intl.NumberFormat('zh-CN')

// ---------- usage numbers (shared by Home and Usage, like the client) ----------
function useUsage() {
  return useMemo(() => {
    const grid = usageGrid()
    const flat = grid.flat().filter((c) => c > 0)
    const total = flat.reduce((a, b) => a + b, 0)
    const week = grid[grid.length - 1].filter((c) => c > 0).reduce((a, b) => a + b, 0)
    const cpm = 212
    return { grid, total, week, days: flat.length, sessions: Math.round(total / 38), minutes: Math.round(total / cpm), cpm }
  }, [])
}

// ---------- shortcut field ----------
const MOD_LABEL: Record<string, string> = { Meta: '⌘', Alt: '⌥', Control: '⌃', Shift: '⇧' }

function keyName(e: KeyboardEvent) {
  if (e.code === 'Space') return 'Space'
  if (e.key.length === 1) return e.key.toUpperCase()
  return e.key
}

function ShortcutField({ ctx, id }: { ctx: Ctx; id: 'transcribe' | 'translate' }) {
  const [rec, setRec] = useState(false)
  const [preview, setPreview] = useState<string[]>([])
  const box = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<string[]>([])
  const ctxRef = useRef(ctx)
  ctxRef.current = ctx
  const chips = ctx.state.bindings[id]
  const isDefault = chips.join('+') === DEFAULT_BINDINGS[id].join('+')

  useEffect(() => {
    if (!rec) return
    pendingRef.current = []
    const down = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        setRec(false)
        return
      }
      const mods = (['Control', 'Alt', 'Shift', 'Meta'] as const).filter((m) => e.getModifierState(m)).map((m) => MOD_LABEL[m])
      const main = MOD_LABEL[e.key] ? null : keyName(e)
      pendingRef.current = main ? [...mods, main] : mods
      setPreview(pendingRef.current)
    }
    const up = (e: KeyboardEvent) => {
      e.preventDefault()
      const stillHeld = (['Control', 'Alt', 'Shift', 'Meta'] as const).some((m) => e.getModifierState(m))
      const pending = pendingRef.current
      if (pending.length && (!MOD_LABEL[e.key] || !stillHeld)) {
        ctxRef.current.setState((s) => ({ ...s, bindings: { ...s.bindings, [id]: pending } }))
        ctxRef.current.toast(`快捷键已设为 ${pending.join(' + ')}`)
        setRec(false)
      }
    }
    const outside = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setRec(false)
    }
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', up, true)
    window.addEventListener('mousedown', outside)
    return () => {
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', up, true)
      window.removeEventListener('mousedown', outside)
    }
  }, [rec, id])

  const shown = rec ? preview : chips
  return (
    <div ref={box} className={'sx-binding' + (rec ? ' rec' : '')}>
      <button
        type="button"
        className="sx-binding-keys"
        onClick={() => {
          setPreview([])
          setRec(true)
        }}
      >
        {shown.length ? (
          shown.map((c, i) => (
            <kbd key={c + i} className={'sx-key' + (rec ? ' active' : '')}>
              {c}
            </kbd>
          ))
        ) : (
          <span className="sx-hint" style={{ fontSize: 14, padding: '0 8px' }}>
            请按下快捷键…
          </span>
        )}
      </button>
      {!isDefault && !rec && (
        <button
          type="button"
          className="sx-reset"
          title="恢复默认"
          aria-label="恢复默认"
          onClick={() => ctx.setState((s) => ({ ...s, bindings: { ...s.bindings, [id]: DEFAULT_BINDINGS[id] } }))}
        >
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  )
}

// ---------- Home ----------
export function HomePage({ ctx }: { ctx: Ctx }) {
  const u = useUsage()
  return (
    <Page title="首页">
      <div className="sx-hero">
        <div className="sx-hero-top">
          <img src="/mark.svg" width={36} height={36} alt="" />
          顺口一说，即刻上屏。
        </div>
        <p>按住快捷键说话，文字会直接落到光标所在的位置。</p>
        <div className="sx-hero-stats">
          <div>
            <small>本周输入</small>
            <b>{nf.format(u.week)}</b>
          </div>
          <div>
            <small>你的说话速度</small>
            <b>{u.cpm}</b>
            <em>字 / 分钟</em>
          </div>
          <div>
            <small>比打字快</small>
            <b>{Math.round((u.cpm / 40 - 1) * 100)}%</b>
          </div>
        </div>
      </div>
      <Section>
        <Row title="语音输入" description="按下开始和停止语音输入。">
          <ShortcutField ctx={ctx} id="transcribe" />
        </Row>
        <Row title="翻译" description="按下开始和停止翻译。">
          <ShortcutField ctx={ctx} id="translate" />
        </Row>
        <Row title="触发方式" description="短按一次开始、再按一次结束；或按住说话、松开结束。" stacked>
          <Segmented<Activation>
            value={ctx.state.activation}
            onChange={(v) => ctx.set('activation', v)}
            options={[
              { value: 'hold_or_toggle', label: '短按切换 + 按住说话' },
              { value: 'toggle', label: '仅短按切换' },
              { value: 'push_to_talk', label: '仅按住说话' },
            ]}
          />
        </Row>
      </Section>
      <div className="sx-tips">
        <p>录音时：按 Esc 或点 ✕ 取消，点 ✓ 结束。先按住 Fn 再按左 Shift，会把正在进行的口述切换为翻译。</p>
        <p style={{ marginTop: 6 }}>Fn 键只在 Apple 键盘上有效。使用第三方键盘时，请改用其他快捷键。</p>
      </div>
    </Page>
  )
}

// ---------- History ----------
function HistoryDetails({ item, onClose }: { item: HistoryItem; onClose: () => void }) {
  return (
    <div className="sx-scrim" onClick={onClose}>
      <div className="sx-modal" role="dialog" aria-label="详情" onClick={(e) => e.stopPropagation()}>
        <h3>
          详情
          <Btn variant="ghost" aria-label="关闭" onClick={onClose}>
            <X size={15} />
          </Btn>
        </h3>
        <dl className="sx-kv">
          <dt>识别原文</dt>
          <dd>{item.raw}</dd>
          <dt>最终插入</dt>
          <dd>{item.text}</dd>
          <dt>录音时长</dt>
          <dd>{item.secs} 秒</dd>
          <dt>语音识别</dt>
          <dd>
            {item.asr} <Chip neutral>{item.asrRoute}</Chip>
          </dd>
          <dt>文本模型</dt>
          <dd>{item.text_model ?? '没有可用的文本模型结果。'}</dd>
          {item.tokens && (
            <>
              <dt>Token 用量</dt>
              <dd>
                输入 {item.tokens[0]} · 输出 {item.tokens[1]}
              </dd>
            </>
          )}
          <dt>耗时</dt>
          <dd>{item.ms} 毫秒</dd>
        </dl>
      </div>
    </div>
  )
}

export function HistoryPage({ ctx }: { ctx: Ctx }) {
  const [filter, setFilter] = useState<'all' | 'dictate' | 'translate'>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<HistoryItem | null>(null)
  const list = HISTORY.filter((h) => (filter === 'all' || h.mode === filter) && (!q || h.text.includes(q) || h.raw.includes(q)))
  const groups: [string, HistoryItem[]][] = [
    ['今天', list.filter((h) => h.day === 0)],
    ['昨天', list.filter((h) => h.day === 1)],
    ['更早', list.filter((h) => h.day === 2)],
  ]
  return (
    <Page title="历史" fill>
      <Section
        fill
        toolbar={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: '全部' },
                { value: 'dictate', label: '口述' },
                { value: 'translate', label: '翻译' },
              ]}
            />
            <div className="sx-search" style={{ flex: 1, minWidth: 140 }}>
              <Search size={15} />
              <input className="sx-input" placeholder="搜索" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        }
      >
        {list.length === 0 && <div className="sx-row sx-hint">没有匹配的记录。</div>}
        {groups.map(([label, items]) =>
          items.length ? (
            <div key={label}>
              <div className="sx-group">{label}</div>
              {items.map((h) => (
                <div key={h.id} className="sx-hist" onClick={() => setOpen(h)}>
                  <time>{h.time}</time>
                  <div className="body">
                    <p>{h.text}</p>
                    <div className="meta">
                      {h.mode === 'translate' && <Chip>翻译</Chip>}
                      <span>{h.asr}</span>
                    </div>
                  </div>
                  <Btn
                    variant="ghost"
                    aria-label="复制"
                    onClick={(e) => {
                      e.stopPropagation()
                      void navigator.clipboard?.writeText(h.text).catch(() => {})
                      ctx.toast('已复制到剪贴板')
                    }}
                  >
                    <Copy size={14} />
                  </Btn>
                </div>
              ))}
            </div>
          ) : null,
        )}
      </Section>
      {open && <HistoryDetails item={open} onClose={() => setOpen(null)} />}
    </Page>
  )
}

// ---------- Usage ----------
const TINTS = ['#ff8c5a', '#ffc24d', '#7db98a', '#6fa8dc', '#a58bd6', '#e88aa3']

function Metric({ label, value, hint, i }: { label: string; value: string; hint?: string; i: number }) {
  return (
    <div className="sx-metric" style={{ background: `color-mix(in srgb, ${TINTS[i]} var(--tint), var(--surface))` }}>
      <small>{label}</small>
      <b>{value}</b>
      {hint && <em>{hint}</em>}
    </div>
  )
}

export function UsagePage() {
  const [filter, setFilter] = useState<'all' | 'dictate' | 'translate'>('all')
  const u = useUsage()
  const k = filter === 'all' ? 1 : filter === 'dictate' ? 0.82 : 0.18
  const s = (n: number) => nf.format(Math.round(n * k))
  const hours = Math.floor((u.minutes * k) / 60)
  return (
    <Page title="使用情况">
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: '全部' },
          { value: 'dictate', label: '口述' },
          { value: 'translate', label: '翻译' },
        ]}
      />
      <div className="sx-metrics" key={filter}>
        <Metric i={0} label="本周输入" value={s(u.week)} hint="字" />
        <Metric i={1} label="累计输入" value={s(u.total)} hint="字" />
        <Metric i={2} label="使用次数" value={s(u.sessions)} hint={filter === 'all' ? '口述 82% · 翻译 18%' : undefined} />
        <Metric i={3} label="说话时长" value={`${hours} 小时 ${Math.round(u.minutes * k) % 60} 分`} />
        <Metric i={4} label="平均速度" value={String(u.cpm)} hint="字 / 分钟" />
        <Metric i={5} label="比打字快" value={`${Math.round((u.cpm / 40 - 1) * 100)}%`} hint="以 40 字 / 分钟为基准" />
      </div>
      <Section title={`已打卡 ${u.days} 天`} description="连续 12 天 · 最长 23 天">
        <div className="sx-heat">
          {u.grid.map((week, w) => (
            <div key={w}>
              {week.map((c, d) => {
                const l = levelFor(c)
                return <span key={d} className={l < 0 ? 'future' : l ? `l${l}` : ''} title={l < 0 ? '' : `${c} 字`} style={{ animationDelay: `${(w * 7 + d) * 6}ms` }} />
              })}
            </div>
          ))}
        </div>
        <div className="sx-legend">
          <span>20 周</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            较少 <span className="sx-dot" /> <span className="sx-dot l1" /> <span className="sx-dot l2" /> <span className="sx-dot l3" /> 较多
          </span>
        </div>
      </Section>
    </Page>
  )
}

// ---------- Models ----------
function LocalModels({ ctx }: { ctx: Ctx }) {
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [scan, setScan] = useState(false)
  const visible = expanded ? LOCAL_MODELS : LOCAL_MODELS.slice(0, 5)
  const timers = useRef<Record<string, number>>({})

  useEffect(() => () => Object.values(timers.current).forEach((t) => window.clearInterval(t)), [])

  const download = (id: string) => {
    setProgress((p) => ({ ...p, [id]: 0 }))
    timers.current[id] = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, (p[id] ?? 0) + 4 + Math.random() * 9)
        if (next >= 100) {
          window.clearInterval(timers.current[id])
          delete timers.current[id]
          const { [id]: _, ...rest } = p
          ctx.setState((s) => ({ ...s, downloaded: [...new Set([...s.downloaded, id])] }))
          ctx.toast('下载完成，可以点「使用」启用')
          return rest
        }
        return { ...p, [id]: next }
      })
    }, 160)
  }
  const cancel = (id: string) => {
    window.clearInterval(timers.current[id])
    delete timers.current[id]
    setProgress(({ [id]: _, ...rest }) => rest)
  }

  return (
    <>
      {visible.map((m) => {
        const pct = progress[m.id]
        const dl = ctx.state.downloaded.includes(m.id)
        const inUse = ctx.state.currentModel === m.id
        let status
        if (pct !== undefined)
          status = (
            <>
              <span className="sx-progress">
                <i style={{ width: `${pct}%` }} />
              </span>
              <span className="sx-hint" style={{ fontVariantNumeric: 'tabular-nums', minWidth: 30 }}>
                {Math.round(pct)}%
              </span>
              <Btn onClick={() => cancel(m.id)}>取消下载</Btn>
            </>
          )
        else if (!dl) status = <Btn onClick={() => download(m.id)}>下载</Btn>
        else if (inUse) status = <StatusPill ok>使用中</StatusPill>
        else
          status = (
            <>
              <Btn
                onClick={() => {
                  ctx.set('currentModel', m.id)
                  ctx.toast(`已切换到 ${m.name}`)
                }}
              >
                使用
              </Btn>
              <Btn variant="danger" onClick={() => ctx.setState((s) => ({ ...s, downloaded: s.downloaded.filter((d) => d !== m.id) }))}>
                删除
              </Btn>
            </>
          )
        return (
          <Row
            key={m.id}
            title={
              <>
                <span>{m.name}</span>
                {m.recommended && <Chip>推荐</Chip>}
              </>
            }
            description={`${m.size} MB · ${m.langs}`}
          >
            {status}
          </Row>
        )
      })}
      <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? '−' : `+${LOCAL_MODELS.length - 5}`}
          </Btn>
          <Btn onClick={() => ctx.toast('网页里不能选择文件夹，客户端会打开访达')}>
            <FolderOpen size={14} />
            导入已有模型文件夹
          </Btn>
          <Btn
            variant="ghost"
            aria-label="rescan"
            onClick={() => {
              setScan(true)
              window.setTimeout(() => setScan(false), 900)
            }}
          >
            <RefreshCw size={14} className={scan ? 'sx-spin' : ''} />
          </Btn>
        </div>
        <p className="sx-hint">选择包含 model.int8.onnx 和 tokens.txt 的 SenseVoice 文件夹，不会重新下载。</p>
      </div>
    </>
  )
}

function useTest(ctx: Ctx, ok: () => string | null) {
  const [testing, setTesting] = useState(false)
  const run = () => {
    setTesting(true)
    window.setTimeout(() => {
      setTesting(false)
      const err = ok()
      if (err) ctx.toast(err, true)
      else ctx.toast(`连接成功（${320 + Math.round(Math.random() * 400)} 毫秒）`)
    }, 900)
  }
  return { testing, run }
}

function CloudBody({ ctx }: { ctx: Ctx }) {
  const v = CLOUD_VENDORS[ctx.state.vendor]
  const [key, setKey] = useState('')
  const { testing, run } = useTest(ctx, () => (key.trim() ? null : '连接失败：缺少 API Key（演示）'))
  return (
    <>
      <Row title="服务商">
        <select className="sx-select" value={ctx.state.vendor} onChange={(e) => ctx.set('vendor', e.target.value as CloudVendor)}>
          <option value="dashscope">阿里云百炼 Qwen-ASR</option>
          <option value="glm">智谱 GLM-ASR</option>
          <option value="stepfun">阶跃星辰 StepAudio ASR</option>
        </select>
      </Row>
      <Row title="服务地址" description={`默认 ${v.endpoint}。`} stacked>
        <input className="sx-input w-full" defaultValue={v.endpoint} key={ctx.state.vendor} spellCheck={false} />
      </Row>
      <Row title="API Key" description={v.keyDesc} stacked>
        <input className="sx-input w-full" type="password" placeholder="sk-…" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
      </Row>
      <Row title="模型">
        <input className="sx-input w-56" defaultValue={v.model} key={ctx.state.vendor + 'm'} spellCheck={false} />
      </Row>
      <Row title={v.dictLabel} description={v.dictDesc}>
        <Switch checked={ctx.state.sendDictionary} onChange={(c) => ctx.set('sendDictionary', c)} />
      </Row>
      <div style={{ padding: '12px 0' }}>
        <Btn disabled={testing} onClick={run}>
          {testing ? '测试中…' : '测试'}
        </Btn>
      </div>
    </>
  )
}

const POST_DESC: Record<PostMode, string> = {
  off: '直接插入识别结果（仍会应用词典替换）。',
  fix: '只修正错字、断句和标点。',
  polish: '去掉口头语、理顺表达，不改变意思。',
}

function TextBody({ ctx }: { ctx: Ctx }) {
  const p = TEXT_PROVIDERS.find((x) => x.id === ctx.state.textProvider) ?? TEXT_PROVIDERS[0]
  const apple = p.id === 'apple_intelligence'
  const configured = Boolean(p.model) && (apple || p.id === 'custom' || Boolean(ctx.state.apiKey.trim()))
  const { testing, run } = useTest(ctx, () => (configured ? null : '文本模型不可用：请先填写 API Key 和模型'))
  return (
    <>
      {!configured && (
        <div style={{ paddingTop: 16, borderTop: 0 }}>
          <div className="sx-notice">还没有配置文本模型：口述会直接插入识别结果，翻译不可用。</div>
        </div>
      )}
      <Row title="服务商">
        <select className="sx-select" value={p.id} onChange={(e) => ctx.set('textProvider', e.target.value)}>
          {TEXT_PROVIDERS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
      </Row>
      {!apple && (
        <>
          <Row title="Base URL" stacked>
            <input className="sx-input w-full" defaultValue={p.base} key={p.id} disabled={!p.edit} spellCheck={false} />
          </Row>
          <Row title="API Key" stacked>
            <input className="sx-input w-full" type="password" placeholder="sk-…" value={ctx.state.apiKey} onChange={(e) => ctx.set('apiKey', e.target.value)} autoComplete="off" />
          </Row>
        </>
      )}
      <Row title="模型">
        <input className="sx-input w-56" defaultValue={p.model} key={p.id + 'm'} spellCheck={false} />
        {!apple && (
          <Btn variant="ghost" aria-label="获取模型列表" title="获取模型列表" onClick={() => ctx.toast('客户端会从服务商拉取可用模型')}>
            <RefreshCw size={14} />
          </Btn>
        )}
      </Row>
      <div style={{ padding: '12px 0' }}>
        <Btn disabled={testing} onClick={run}>
          {testing ? '测试中…' : '测试'}
        </Btn>
      </div>
      <Row title="口述整理" description={POST_DESC[ctx.state.postMode]} stacked>
        <Segmented<PostMode>
          value={ctx.state.postMode}
          onChange={(v) => ctx.set('postMode', v)}
          options={[
            { value: 'off', label: '关闭' },
            { value: 'fix', label: '仅纠错' },
            { value: 'polish', label: '整理' },
          ]}
        />
      </Row>
    </>
  )
}

export function ModelsPage({ ctx }: { ctx: Ctx }) {
  const [tab, setTab] = useState<'asr' | 'text'>('asr')
  return (
    <Page title="模型">
      <TabbedSection
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'asr', label: '语音识别', icon: <AudioLines size={20} />, description: '把声音转成文字。' },
          { value: 'text', label: '文本模型', icon: <Sparkles size={20} />, description: '用于整理口述和翻译。启用后，识别出的文字会发送到所选服务。' },
        ]}
      >
        {tab === 'asr' ? (
          <>
            <Row title="识别方式" description={ctx.state.asr === 'local' ? '离线运行，音频不会离开这台 Mac。' : '音频会上传到所选服务商识别。'}>
              <Segmented
                value={ctx.state.asr}
                onChange={(v) => ctx.set('asr', v)}
                options={[
                  { value: 'local', label: '本地识别' },
                  { value: 'cloud', label: '云端识别' },
                ]}
              />
            </Row>
            {ctx.state.asr === 'local' ? <LocalModels ctx={ctx} /> : <CloudBody ctx={ctx} />}
          </>
        ) : (
          <TextBody ctx={ctx} />
        )}
      </TabbedSection>
    </Page>
  )
}

// ---------- Dictionary ----------
export function DictionaryPage({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [term, setTerm] = useState('')
  const [aliases, setAliases] = useState('')
  const [fresh, setFresh] = useState<number | null>(null)
  const list = ctx.state.dict.filter((d) => !q || d.term.toLowerCase().includes(q.toLowerCase()) || d.aliases.includes(q))

  const add = () => {
    if (!term.trim()) return
    const id = Date.now()
    ctx.setState((s) => ({ ...s, dict: [{ id, term: term.trim(), aliases: aliases.trim() }, ...s.dict] }))
    setFresh(id)
    setTerm('')
    setAliases('')
    setAdding(false)
  }

  return (
    <Page title="词典" description="专有名词和常见误识别。识别后按字面替换，并提示给文本模型；翻译时使用固定译法。" fill>
      <Section
        fill
        toolbar={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="sx-search" style={{ flex: 1 }}>
              <Search size={15} />
              <input className="sx-input" placeholder="搜索词条" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Btn onClick={() => ctx.toast('客户端支持按行导入：标准写法 | 误识别1, 误识别2 | 固定译法 | 备注')}>导入</Btn>
            <Btn variant="primary" style={{ height: 28, fontSize: 12, padding: '0 10px' }} onClick={() => setAdding(!adding)}>
              <Plus size={14} />
              添加词条
            </Btn>
          </div>
        }
      >
        {adding && (
          <div className="sx-dict-form sx-row-enter">
            <input className="sx-input" autoFocus placeholder="标准写法" value={term} onChange={(e) => setTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <input className="sx-input" placeholder="常见误识别，用逗号分隔" value={aliases} onChange={(e) => setAliases(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <Btn onClick={add}>保存</Btn>
          </div>
        )}
        {list.length === 0 && <div className="sx-row sx-hint">还没有词条。添加你常说的产品名、人名或术语。</div>}
        {list.map((d) => (
          <div key={d.id} className={'sx-dict' + (d.id === fresh ? ' sx-row-enter' : '')}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="term">
                {d.term} {d.translation && <Chip neutral>译作 {d.translation}</Chip>}
              </div>
              {d.aliases && <div className="aliases">常见误识别：{d.aliases}</div>}
            </div>
            <Btn variant="danger" aria-label="删除" onClick={() => ctx.setState((s) => ({ ...s, dict: s.dict.filter((x) => x.id !== d.id) }))}>
              <Trash2 size={14} />
            </Btn>
          </div>
        ))}
      </Section>
    </Page>
  )
}

// ---------- Settings ----------
function UpdateRow() {
  const [state, setState] = useState<'idle' | 'checking' | 'done'>('idle')
  return (
    <Row title="检查更新" description={state === 'done' ? '已是最新版本。' : '从 GitHub 获取最新版本信息。'}>
      <Btn
        disabled={state === 'checking'}
        onClick={() => {
          setState('checking')
          window.setTimeout(() => setState('done'), 800)
        }}
      >
        {state === 'checking' ? '检查中…' : '检查更新'}
      </Btn>
    </Row>
  )
}

export function SettingsPage({ ctx }: { ctx: Ctx }) {
  const [tab, setTab] = useState<'general' | 'permissions' | 'about'>('general')
  const s = ctx.state
  const perms = [
    ['microphone', '麦克风', '录制你的声音。'],
    ['accessibility', '辅助功能', '把文字粘贴到当前输入框。'],
    ['inputMonitoring', '输入监控', '识别 Fn 等全局快捷键。'],
  ] as const
  return (
    <Page title="设置">
      <TabbedSection
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'general', label: '通用', icon: <SlidersHorizontal size={20} /> },
          { value: 'permissions', label: '权限', icon: <Shield size={20} />, description: '顺口说 需要以下权限才能在任意应用中输入文字。' },
          { value: 'about', label: '关于', icon: <Info size={20} /> },
        ]}
      >
        {tab === 'general' && (
          <>
            <Row title="开机启动" description="登录后在菜单栏运行 顺口说。">
              <Switch checked={s.autostart} onChange={(v) => ctx.set('autostart', v)} />
            </Row>
            <Row title="默认翻译语言" description="录音时也可以在悬浮条上临时切换。">
              <select className="sx-select" value={s.target} onChange={(e) => ctx.set('target', e.target.value)}>
                {TRANSLATE_TARGETS.map((c) => (
                  <option key={c} value={c}>
                    {languageLabel(c)}
                  </option>
                ))}
              </select>
            </Row>
            <Row title="麦克风" description="用于语音输入的输入设备。">
              <select className="sx-select" value={s.mic} onChange={(e) => ctx.set('mic', e.target.value)}>
                <option>默认</option>
                <option>MacBook Pro 麦克风</option>
                <option>AirPods Pro</option>
              </select>
            </Row>
            <Row title="悬浮条位置">
              <select className="sx-select" value={s.overlay} onChange={(e) => ctx.set('overlay', e.target.value as 'top' | 'bottom')}>
                <option value="bottom">屏幕底部</option>
                <option value="top">屏幕顶部</option>
              </select>
            </Row>
            <Row title="保留结果在剪贴板" description="插入文字后，把结果也留在剪贴板中。">
              <Switch checked={s.clipboard} onChange={(v) => ctx.set('clipboard', v)} />
            </Row>
            <Row title="外观">
              <Segmented<Theme>
                value={s.theme}
                onChange={(v) => ctx.set('theme', v)}
                options={[
                  { value: 'system', label: '跟随系统' },
                  { value: 'light', label: '浅色' },
                  { value: 'dark', label: '深色' },
                ]}
              />
            </Row>
            <Row title="界面语言">
              <select className="sx-select" value={s.appLang} onChange={(e) => ctx.set('appLang', e.target.value as 'zh' | 'en')}>
                <option value="zh">简体中文</option>
                <option value="en">English</option>
              </select>
            </Row>
          </>
        )}
        {tab === 'permissions' && (
          <>
            {perms.map(([k, title, desc]) => (
              <Row key={k} title={title} description={desc}>
                {s.perms[k] ? (
                  <StatusPill ok>已授权</StatusPill>
                ) : (
                  <Btn
                    onClick={() => {
                      ctx.setState((st) => ({ ...st, perms: { ...st.perms, [k]: true } }))
                      ctx.toast(`已授予「${title}」（演示）`)
                    }}
                  >
                    授权
                  </Btn>
                )}
              </Row>
            ))}
            <Row title="Fn 键行为" description="已设为「不执行任何操作」">
              <StatusPill ok>正常</StatusPill>
            </Row>
            <div className="sx-row sx-hint" style={{ fontSize: 13 }}>
              授权后如果快捷键仍无反应，请退出并重新打开 顺口说。
            </div>
          </>
        )}
        {tab === 'about' && (
          <Row
            title={
              <>
                <img src="/mark.svg" width={18} height={18} alt="" />
                顺口说
              </>
            }
            description={
              <>
                版本 {latest.version}
                <br />
                基于开源项目 Handy（MIT）。
              </>
            }
          >
            <Btn onClick={() => ctx.toast('客户端会在访达中打开日志文件夹')}>打开日志文件夹</Btn>
            <Btn variant="danger" onClick={() => ctx.toast('网页里的顺口说退不掉 :)')}>
              退出 顺口说
            </Btn>
          </Row>
        )}
        {tab === 'about' && <UpdateRow />}
      </TabbedSection>
    </Page>
  )
}
