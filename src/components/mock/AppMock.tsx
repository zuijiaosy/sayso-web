// The client's settings window, clickable in the browser. Sidebar and layout
// follow src/voiceless/SettingsShell.tsx. Other parts of the page can steer it
// with `window.dispatchEvent(new CustomEvent('sx:go', { detail }))`.
import { BookOpen, CircleAlert, CircleCheck, Cpu, Gauge, History, Mic, Settings } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { DictionaryPage, HistoryPage, HomePage, ModelsPage, SettingsPage, UsagePage, type Ctx } from './pages'
import { useMockState, type PageId, type Theme } from './state'

const NAV: { id: PageId; label: string; icon: ReactNode }[] = [
  { id: 'home', label: '首页', icon: <Mic size={17} /> },
  { id: 'history', label: '历史', icon: <History size={17} /> },
  { id: 'usage', label: '使用情况', icon: <Gauge size={17} /> },
  { id: 'models', label: '模型', icon: <Cpu size={17} /> },
  { id: 'dictionary', label: '词典', icon: <BookOpen size={17} /> },
]

export type GoDetail = { page?: PageId; theme?: Theme }

function useSystemDark() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(mq.matches)
    const on = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

export function AppMock() {
  const { state, set, setState, reset } = useMockState()
  const [toast, setToast] = useState<{ id: number; msg: string; err?: boolean } | null>(null)
  const toastTimer = useRef(0)
  const systemDark = useSystemDark()

  const showToast = useCallback((msg: string, err?: boolean) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), msg, err })
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    const onGo = (e: Event) => {
      const d = (e as CustomEvent<GoDetail>).detail
      setState((s) => ({ ...s, ...(d.page ? { page: d.page } : {}), ...(d.theme ? { theme: d.theme } : {}) }))
    }
    window.addEventListener('sx:go', onGo)
    return () => window.removeEventListener('sx:go', onGo)
  }, [setState])

  const ctx: Ctx = useMemo(() => ({ state, set, setState, toast: showToast }), [state, set, setState, showToast])
  const dark = state.theme === 'dark' || (state.theme === 'system' && systemDark)

  const page = (() => {
    switch (state.page) {
      case 'home':
        return <HomePage ctx={ctx} />
      case 'history':
        return <HistoryPage ctx={ctx} />
      case 'usage':
        return <UsagePage />
      case 'models':
        return <ModelsPage ctx={ctx} />
      case 'dictionary':
        return <DictionaryPage ctx={ctx} />
      case 'settings':
        return <SettingsPage ctx={ctx} />
    }
  })()

  const nav = (id: PageId, label: string, icon: ReactNode, extra = '') => (
    <button key={id} type="button" className={`sx-nav ${extra}${state.page === id ? ' on' : ''}`} aria-current={state.page === id ? 'page' : undefined} onClick={() => set('page', id)} title={label}>
      {icon}
      <span>{label}</span>
    </button>
  )

  return (
    <div className="sx" data-theme={dark ? 'dark' : 'light'}>
      <div className="sx-window" role="application" aria-label="顺口说 客户端演示">
        <span className="sx-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <nav className="sx-side" aria-label="客户端导航">
          <div className="sx-brand">
            <img src="/mark.svg" width={22} height={22} alt="" />
            <span>顺口说</span>
          </div>
          {NAV.map((n) => nav(n.id, n.label, n.icon))}
          {nav('settings', '设置', <Settings size={17} />, 'bottom')}
        </nav>
        <main className="sx-main">
          <div key={state.page} style={{ display: 'contents' }}>
            {page}
          </div>
        </main>
        {toast && (
          <div key={toast.id} className={'sx-toast' + (toast.err ? ' err' : '')} role="status">
            {toast.err ? <CircleAlert size={16} /> : <CircleCheck size={16} />}
            {toast.msg}
          </div>
        )}
      </div>
      <div className="sx-under">
        <span>这是用网页重建的客户端界面，所有改动只保存在你的浏览器里。</span>
        <button
          type="button"
          onClick={() => {
            reset()
            showToast('已恢复默认设置')
          }}
        >
          恢复默认
        </button>
      </div>
    </div>
  )
}

export const goTo = (detail: GoDetail) => window.dispatchEvent(new CustomEvent('sx:go', { detail }))
