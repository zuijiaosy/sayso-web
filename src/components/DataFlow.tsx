// "Where your data goes": the three setups from the README drawn as one
// pipeline. Hops that cross the network boundary are drawn in the accent
// colour; hops a setup doesn't use fade out.
import { useState } from 'react'

type Setup = 'local' | 'text' | 'cloud'
type Edge = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7'
type Node = 'mic' | 'local' | 'dict' | 'paste' | 'cloud' | 'llm'

const SETUPS: Record<
  Setup,
  { label: string; edges: Edge[]; nodes: Node[]; caption: string; facts: [string, string][] }
> = {
  local: {
    label: '本地识别，不整理',
    edges: ['e1', 'e2', 'e7'],
    nodes: ['mic', 'local', 'dict', 'paste'],
    caption: '没有一条线穿过网络边界：音频和文字都留在这台 Mac 上。',
    facts: [
      ['音频', '不出本机'],
      ['文字', '不出本机'],
      ['出错时', '本地识别失败就是失败，不会悄悄改用云端。'],
    ],
  },
  text: {
    label: '本地识别 + 文本模型',
    edges: ['e1', 'e2', 'e5', 'e6'],
    nodes: ['mic', 'local', 'dict', 'paste', 'llm'],
    caption: '音频在本机识别；只有识别出的文字和命中的词条会发给你配置的文本模型。',
    facts: [
      ['音频', '不出本机'],
      ['文字', '识别结果和命中的词条'],
      ['出错时', '整理失败就插入识别原文，词典替换已经应用。'],
    ],
  },
  cloud: {
    label: '云端识别',
    edges: ['e3', 'e4', 'e5', 'e6'],
    nodes: ['mic', 'cloud', 'dict', 'paste', 'llm'],
    caption: '音频上传到所选服务商识别；文字的去向取决于文本模型设置。',
    facts: [
      ['音频', '上传到阶跃星辰、阿里云百炼或智谱'],
      ['文字', '取决于文本模型设置'],
      ['出错时', '翻译失败不会插入原文，悬浮条提供「重试」和「复制原文」。'],
    ],
  },
}

// Nodes are capsules, like the app's overlay.
const NODES: Record<Node, { x: number; y: number; label: string; sub: string }> = {
  mic: { x: 85, y: 108, label: '麦克风', sub: '按住 Fn' },
  local: { x: 255, y: 108, label: '本地识别', sub: 'Qwen3-ASR' },
  dict: { x: 440, y: 108, label: '词典替换', sub: '按字面替换' },
  paste: { x: 668, y: 108, label: '落到光标处', sub: '粘贴' },
  cloud: { x: 255, y: 282, label: '云端识别', sub: 'ASR 服务商' },
  llm: { x: 555, y: 282, label: '文本模型', sub: '整理 / 翻译' },
}

const W = 124
const H = 46

const EDGES: Record<Edge, { d: string; label: string; lx: number; ly: number; crosses?: boolean }> = {
  e1: { d: 'M147 108 H187', label: '音频', lx: 167, ly: 98 },
  e2: { d: 'M317 108 H372', label: '识别结果', lx: 345, ly: 98 },
  e7: { d: 'M502 108 H600', label: '直接插入', lx: 551, ly: 98 },
  e3: { d: 'M85 131 V282 H187', label: '上传音频', lx: 118, ly: 200, crosses: true },
  e4: { d: 'M317 282 H415 V137', label: '识别结果', lx: 368, ly: 272, crosses: true },
  e5: { d: 'M465 131 V260 H487', label: '文字 + 命中词条', lx: 470, ly: 200, crosses: true },
  e6: { d: 'M617 282 H668 V137', label: '整理后的文字', lx: 676, ly: 200, crosses: true },
}

export function DataFlow() {
  const [setup, setSetup] = useState<Setup>('text')
  const s = SETUPS[setup]
  const on = (e: Edge) => s.edges.includes(e)
  const onNode = (n: Node) => s.nodes.includes(n)

  return (
    <div className="flow">
      <div className="flow-tabs" role="group" aria-label="选择配置">
        {(Object.keys(SETUPS) as Setup[]).map((k) => (
          <button key={k} type="button" aria-pressed={setup === k} onClick={() => setSetup(k)}>
            {SETUPS[k].label}
          </button>
        ))}
      </div>
      <figure>
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox="0 0 760 330" role="img" aria-label={`${s.label}：${s.caption}`} style={{ minWidth: 620 }}>
            <defs>
              <marker id="df-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
              </marker>
              <marker id="df-arrow-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
              </marker>
            </defs>

            {/* regions */}
            <rect x="10" y="12" width="740" height="170" rx="20" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.12" />
            <text x="30" y="40" fontSize="13" fontWeight="600" fill="currentColor" fillOpacity="0.6">
              这台 Mac
            </text>
            <line x1="10" y1="206" x2="750" y2="206" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
            <text x="290" y="200" textAnchor="middle" fontSize="12" fill="var(--accent)">
              网络边界
            </text>
            <rect x="10" y="230" width="740" height="92" rx="20" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="4 4" />
            <text x="30" y="256" fontSize="13" fontWeight="600" fill="currentColor" fillOpacity="0.6">
              网络上的服务
            </text>

            {/* edges */}
            {(Object.keys(EDGES) as Edge[]).map((k) => {
              const e = EDGES[k]
              const hot = e.crosses
              return (
                <g key={k} className={on(k) ? '' : 'flow-off'}>
                  <path
                    className={'flow-edge' + (on(k) ? '' : ' still')}
                    d={e.d}
                    fill="none"
                    stroke={hot ? 'var(--accent)' : 'currentColor'}
                    strokeWidth="1.8"
                    markerEnd={`url(#${hot ? 'df-arrow-hot' : 'df-arrow'})`}
                  />
                  <text
                    x={e.lx}
                    y={e.ly}
                    textAnchor={k === 'e3' || k === 'e5' || k === 'e6' ? 'start' : 'middle'}
                    fontSize="11.5"
                    fill={hot ? 'var(--accent)' : 'currentColor'}
                    fillOpacity={hot ? 1 : 0.7}
                    dx={k === 'e3' ? -26 : k === 'e5' ? 8 : 0}
                  >
                    {e.label}
                  </text>
                </g>
              )
            })}

            {/* nodes */}
            {(Object.keys(NODES) as Node[]).map((k) => {
              const n = NODES[k]
              return (
                <g key={k} className={'flow-node' + (onNode(k) ? '' : ' flow-off')}>
                  <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={H / 2} fill="var(--surface)" stroke="currentColor" strokeOpacity="0.22" />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                    {n.label}
                  </text>
                  <text x={n.x} y={n.y + 14} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity="0.55">
                    {n.sub}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <figcaption>{s.caption}</figcaption>
      </figure>
      <ul className="facts">
        {s.facts.map(([k, v]) => (
          <li key={k}>
            <b style={{ color: 'var(--ink)' }}>{k}</b>　{v}
          </li>
        ))}
      </ul>
    </div>
  )
}
