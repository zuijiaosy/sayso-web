// State for the web replica of the client. Mirrors the settings the real app
// persists (bindings, activation, models, text model, dictionary, theme…) and
// keeps them in localStorage so a visitor's tweaks survive a reload. Storage is
// optional: every read and write is guarded and the defaults render fine.
import { useEffect, useState } from 'react'

export type PageId = 'home' | 'history' | 'usage' | 'models' | 'dictionary' | 'settings'
export type Theme = 'system' | 'light' | 'dark'
export type Activation = 'hold_or_toggle' | 'toggle' | 'push_to_talk'
export type PostMode = 'off' | 'fix' | 'polish'
export type CloudVendor = 'stepfun' | 'dashscope' | 'glm'
export type DictEntry = { id: number; term: string; aliases: string; translation?: string }

export type MockState = {
  page: PageId
  theme: Theme
  bindings: { transcribe: string[]; translate: string[] }
  activation: Activation
  autostart: boolean
  target: string
  mic: string
  overlay: 'bottom' | 'top'
  clipboard: boolean
  appLang: 'zh' | 'en'
  asr: 'local' | 'cloud'
  currentModel: string
  downloaded: string[]
  vendor: CloudVendor
  sendDictionary: boolean
  textProvider: string
  apiKey: string
  postMode: PostMode
  dict: DictEntry[]
  perms: { microphone: boolean; accessibility: boolean; inputMonitoring: boolean }
}

export const DEFAULT_BINDINGS = { transcribe: ['Fn'], translate: ['Fn', '左 Shift'] }

export const initialState: MockState = {
  page: 'home',
  theme: 'system',
  bindings: DEFAULT_BINDINGS,
  activation: 'hold_or_toggle',
  autostart: true,
  target: 'en-US',
  mic: '默认',
  overlay: 'bottom',
  clipboard: false,
  appLang: 'zh',
  asr: 'local',
  currentModel: 'qwen3-asr-0.6b',
  downloaded: ['qwen3-asr-0.6b'],
  vendor: 'stepfun',
  sendDictionary: true,
  textProvider: 'deepseek',
  apiKey: 'sk-demo-••••••••••••',
  postMode: 'polish',
  dict: [
    { id: 1, term: 'DeepSeek', aliases: 'deep seek, 迪普西克' },
    { id: 2, term: '顺口说', aliases: '顺口硕, 顺口说说', translation: 'Sayso' },
    { id: 3, term: 'Tauri', aliases: '陶瑞, tory' },
    { id: 4, term: 'Qwen3-ASR', aliases: 'queen 3, 千问三' },
  ],
  perms: { microphone: true, accessibility: true, inputMonitoring: false },
}

const KEY = 'sayso-demo-v1'

function load(): MockState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) return { ...initialState, ...(JSON.parse(raw) as Partial<MockState>) }
  } catch {
    /* storage blocked or corrupt: fall back to defaults */
  }
  return initialState
}

export function useMockState() {
  // Start from defaults so the prerendered HTML matches the first client
  // render, then pull the saved state in.
  const [state, setState] = useState<MockState>(initialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(load())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state, ready])

  const set = <K extends keyof MockState>(key: K, value: MockState[K]) => setState((s) => ({ ...s, [key]: value }))
  const reset = () => setState({ ...initialState, page: state.page })
  return { state, set, setState, reset }
}

/** Local models the client lists: Chinese-capable ones, sizes from the catalog. */
export const LOCAL_MODELS = [
  { id: 'qwen3-asr-0.6b', name: 'Qwen3-ASR 0.6B', size: 811, langs: 'zh, en, yue, ja, ko, fr…', recommended: true },
  { id: 'sense-voice-int8', name: 'SenseVoice', size: 152, langs: 'zh, en, yue, ja, ko' },
  { id: 'small', name: 'Whisper Small', size: 465, langs: 'en, zh, de, es, ru, ko…' },
  { id: 'medium', name: 'Whisper Medium', size: 469, langs: 'en, zh, de, es, ru, ko…' },
  { id: 'turbo', name: 'Whisper Turbo', size: 1549, langs: 'en, zh, de, es, ru, ko…' },
  { id: 'large', name: 'Whisper Large', size: 1031, langs: 'en, zh, de, es, ru, ko…' },
  { id: 'breeze-asr', name: 'Breeze ASR', size: 1030, langs: 'zh, en' },
]

export const CLOUD_VENDORS: Record<CloudVendor, { label: string; endpoint: string; model: string; keyDesc: string; dictLabel: string; dictDesc: string }> = {
  stepfun: {
    label: '阶跃星辰 StepAudio ASR',
    endpoint: 'https://api.stepfun.com/v1',
    model: 'stepaudio-2.5-asr',
    keyDesc: '在阶跃星辰开放平台（platform.stepfun.com）「接口密钥」中创建的 API Key。',
    dictLabel: '把词典作为热词',
    dictDesc: '最多发送 100 个标准写法。仅支持中英文；较长的录音会按 3 分钟分段并行识别。',
  },
  dashscope: {
    label: '阿里云百炼 Qwen-ASR',
    endpoint: 'https://dashscope.aliyuncs.com',
    model: 'qwen3-asr-flash',
    keyDesc: '留空时使用下方「阿里云百炼」文本模型的 Key。',
    dictLabel: '把词典作为识别上下文',
    dictDesc: '词典中的标准写法会随音频一起发送。',
  },
  glm: {
    label: '智谱 GLM-ASR',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-asr-2512',
    keyDesc: '在智谱开放平台（bigmodel.cn）创建的 API Key。',
    dictLabel: '把词典作为热词',
    dictDesc: '最多发送 100 个标准写法。GLM-ASR 单次最长 30 秒，更长的录音会自动分段识别。',
  },
}

/** Text-model providers from settings.rs, in the client's order. */
export const TEXT_PROVIDERS = [
  { id: 'deepseek', label: 'DeepSeek', base: 'https://api.deepseek.com', model: 'deepseek-flash', edit: false },
  { id: 'dashscope', label: '阿里云百炼 (DashScope)', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: '', edit: true },
  { id: 'openai', label: 'OpenAI', base: 'https://api.openai.com/v1', model: '', edit: false },
  { id: 'zai', label: 'Z.AI', base: 'https://api.z.ai/api/paas/v4', model: '', edit: false },
  { id: 'openrouter', label: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: '', edit: false },
  { id: 'anthropic', label: 'Anthropic', base: 'https://api.anthropic.com/v1', model: '', edit: false },
  { id: 'groq', label: 'Groq', base: 'https://api.groq.com/openai/v1', model: '', edit: false },
  { id: 'apple_intelligence', label: 'Apple Intelligence', base: '', model: 'Apple Intelligence', edit: false },
  { id: 'custom', label: 'Custom', base: 'http://localhost:11434/v1', model: '', edit: true },
]

/** Translation targets from src-tauri/src/voice.rs. */
export const TRANSLATE_TARGETS = ['en-US', 'en-GB', 'zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES', 'es-MX', 'pt-BR', 'it-IT', 'ru-RU', 'vi-VN', 'th-TH', 'id-ID', 'ar-SA']

export function languageLabel(code: string) {
  try {
    return new Intl.DisplayNames(['zh-CN', 'en'], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

// ---------- sample history & usage ----------

export type HistoryItem = {
  id: number
  day: 0 | 1 | 2
  time: string
  mode: 'dictate' | 'translate'
  raw: string
  text: string
  asr: string
  asrRoute: '本地' | '云端'
  text_model?: string
  tokens?: [number, number]
  ms: number
  secs: number
}

export const HISTORY: HistoryItem[] = [
  { id: 1, day: 0, time: '10:42', mode: 'dictate', raw: '嗯那个我们明天下午三点开个会吧就是讨论一下官网首页的那个设计', text: '我们明天下午三点开个会，讨论一下官网首页的设计。', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [412, 36], ms: 820, secs: 6.1 },
  { id: 2, day: 0, time: '10:17', mode: 'translate', raw: '这个功能下周一上线请大家提前测一下', text: 'This feature ships next Monday — please test it ahead of time.', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [388, 24], ms: 910, secs: 3.8 },
  { id: 3, day: 0, time: '09:55', mode: 'dictate', raw: '帮我把这个 bug 修一下就是用户点了保存以后那个列表没有刷新', text: '帮我修一下这个 bug：用户点击保存后，列表没有刷新。', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [405, 31], ms: 760, secs: 5.2 },
  { id: 4, day: 0, time: '09:31', mode: 'dictate', raw: '周报本周完成了词典导入导出还有历史详情页', text: '周报：本周完成了词典导入导出和历史详情页。', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [398, 22], ms: 690, secs: 4.4 },
  { id: 5, day: 1, time: '21:08', mode: 'dictate', raw: '今天用顺口说试了一下 DeepSeek 整理出来的效果呃还挺自然的', text: '今天用顺口说试了 DeepSeek，整理出来的效果很自然。', asr: 'StepAudio ASR', asrRoute: '云端', text_model: 'DeepSeek · deepseek-flash', tokens: [420, 27], ms: 1240, secs: 5.6 },
  { id: 6, day: 1, time: '16:40', mode: 'translate', raw: '谢谢你的反馈我们会在下一个版本修复', text: 'Thanks for the feedback — we’ll fix it in the next release.', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [376, 19], ms: 880, secs: 3.1 },
  { id: 7, day: 1, time: '14:02', mode: 'dictate', raw: '晚上七点在老地方吃饭别迟到啊', text: '晚上七点老地方吃饭，别迟到啊。', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', ms: 310, secs: 2.4 },
  { id: 8, day: 2, time: '周二', mode: 'dictate', raw: '把会议纪要发到群里然后抄送给产品和设计', text: '把会议纪要发到群里，并抄送给产品和设计。', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [401, 20], ms: 740, secs: 3.9 },
  { id: 9, day: 2, time: '周一', mode: 'translate', raw: '我们的接口限流是每分钟六十次', text: 'Our API is rate-limited to 60 requests per minute.', asr: 'Qwen3-ASR 0.6B', asrRoute: '本地', text_model: 'DeepSeek · deepseek-flash', tokens: [380, 14], ms: 800, secs: 2.9 },
]

/** Deterministic pseudo-random usage for the last 20 weeks. */
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function usageGrid(weeks = 20) {
  const rnd = mulberry32(7)
  // columns of 7 days, oldest first; the last column is this week
  const today = (new Date().getDay() + 6) % 7
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      if (w === weeks - 1 && d > today) return -1
      const ramp = 0.35 + (w / weeks) * 0.8
      const r = rnd()
      if (r < 0.22 / ramp) return 0
      return Math.round(r * 1400 * ramp)
    }),
  )
}

export const levelFor = (chars: number) => (chars < 0 ? -1 : chars <= 0 ? 0 : chars < 200 ? 1 : chars < 800 ? 2 : 3)
