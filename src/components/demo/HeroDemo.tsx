// The hero's live demo: a chat window stands in for "whatever app has focus",
// and the overlay capsule sits at the bottom of the screen exactly like the
// client's. Hold the button (or tap to toggle) to "speak" one of the scripted
// samples; the transcript goes through recognition, cleanup or translation
// and lands in the input box. Plays by itself until the visitor takes over.
import { Mic } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Capsule } from './Capsule'
import { outputFor, samples, type Cleanup, type Target } from './samples'

type Phase = 'idle' | 'recording' | 'transcribing' | 'processing' | 'pasted'
type Mode = 'dictate' | 'translate'
type Msg = { id: number; who: string; text: string; me?: boolean }

const CHARS_PER_SEC = 11
const HOLD_MS = 280

const seed: Msg[] = [
  { id: 1, who: '小林', text: '官网的首页草稿放群里了，大家看看？' },
  { id: 2, who: 'Mia', text: '动效挺好，下载按钮再显眼一点。' },
]

const autoplay: { mode: Mode; cleanup: Cleanup; target: Target }[] = [
  { mode: 'dictate', cleanup: 'polish', target: 'en-US' },
  { mode: 'translate', cleanup: 'polish', target: 'en-US' },
  { mode: 'dictate', cleanup: 'fix', target: 'en-US' },
]

export function HeroDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [mode, setMode] = useState<Mode>('dictate')
  const [cleanup, setCleanup] = useState<Cleanup>('polish')
  const [target, setTarget] = useState<Target>('en-US')
  const [idx, setIdx] = useState(0)
  const [spoken, setSpoken] = useState(0)
  const [typed, setTyped] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>(seed)
  const [touched, setTouched] = useState(false)

  const timers = useRef<number[]>([])
  const pressAt = useRef(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const chatRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const autoStep = useRef(0)

  const sample = samples[idx % samples.length]
  const output = outputFor(sample, mode, cleanup, target)

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  // Reveal the spoken words while recording, then stop on its own once the
  // sentence is finished (the real app waits for you; the demo shouldn't).
  useEffect(() => {
    if (phase !== 'recording') return
    if (spoken >= sample.said.length) {
      const id = window.setTimeout(() => finish(), 500)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => setSpoken((n) => n + 1), 1000 / CHARS_PER_SEC)
    return () => window.clearTimeout(id)
  }, [phase, spoken, sample.said.length])

  // Paste: the text arrives in one go in the app; a quick sweep makes it
  // visible here.
  useEffect(() => {
    if (phase !== 'pasted' || typed >= output.length) return
    const id = window.setTimeout(() => setTyped((n) => Math.min(output.length, n + 3)), 16)
    return () => window.clearTimeout(id)
  }, [phase, typed, output.length])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const start = useCallback(() => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'pasted') return
    clearTimers()
    if (phaseRef.current === 'pasted') send()
    setSpoken(0)
    setTyped(0)
    setPhase('recording')
  }, [])

  function send() {
    setMsgs((m) => [...m.slice(-5), { id: Date.now(), who: '我', text: outputRef.current, me: true }])
    setTyped(0)
    setIdx((i) => i + 1)
  }
  const outputRef = useRef(output)
  outputRef.current = output

  function finish() {
    if (phaseRef.current !== 'recording') return
    setSpoken(Infinity)
    setPhase('transcribing')
    const skipCleanup = mode === 'dictate' && cleanup === 'off'
    later(() => setPhase(skipCleanup ? 'pasted' : 'processing'), 750)
    if (!skipCleanup) later(() => setPhase('pasted'), 750 + 950)
    later(
      () => {
        send()
        setPhase('idle')
      },
      (skipCleanup ? 750 : 1700) + 2600,
    )
  }

  function cancel() {
    clearTimers()
    setSpoken(0)
    setTyped(0)
    setPhase('idle')
  }

  // Autoplay until the visitor interacts, and only while the demo is on screen.
  useEffect(() => {
    if (touched || phase !== 'idle') return
    const el = rootRef.current
    if (!el) return
    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    const id = window.setTimeout(() => {
      if (!visible || document.hidden) return
      const step = autoplay[autoStep.current++ % autoplay.length]
      setMode(step.mode)
      setCleanup(step.cleanup)
      setTarget(step.target)
      start()
    }, autoStep.current === 0 ? 1400 : 1800)
    return () => {
      window.clearTimeout(id)
      io.disconnect()
    }
  }, [touched, phase, start])

  const takeOver = () => setTouched(true)

  // Hold-or-toggle, like the app's default activation: a short press toggles,
  // a long press records until release.
  const onDown = () => {
    takeOver()
    if (phaseRef.current === 'recording') {
      finish()
      pressAt.current = 0
      return
    }
    pressAt.current = Date.now()
    start()
  }
  const onUp = () => {
    if (!pressAt.current) return
    const held = Date.now() - pressAt.current
    pressAt.current = 0
    if (held > HOLD_MS && phaseRef.current === 'recording') finish()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phaseRef.current === 'recording') cancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimers()
    }
  }, [])

  const recording = phase === 'recording'
  const showCapsule = phase === 'recording' || phase === 'transcribing' || phase === 'processing'
  const draft = phase === 'pasted' ? output.slice(0, typed) : ''
  const heard = sample.said.slice(0, spoken)

  return (
    <div className="hd" ref={rootRef}>
      <div className="hd-screen">
        <div className="hd-win">
          <div className="hd-bar">
            <span className="hd-lights">
              <i />
              <i />
              <i />
            </span>
            <span className="hd-title"># 官网改版</span>
          </div>
          <div className="hd-chat" ref={chatRef}>
            {msgs.map((m) => (
              <div key={m.id} className={'hd-msg' + (m.me ? ' me' : '')}>
                <span className="hd-av">{m.who.slice(0, 1)}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className={'hd-input' + (phase === 'pasted' ? ' flash' : '')}>
            {draft ? <span>{draft}</span> : <span className="ph">发消息到 #官网改版</span>}
            <i className="caret" />
          </div>
        </div>

        <div className="hd-overlay">
          {(recording || phase === 'transcribing') && heard && (
            <div className="hd-heard" aria-live="polite">
              <Mic size={13} />
              <span>{heard}</span>
            </div>
          )}
          {showCapsule && (
            <Capsule
              state={phase as 'recording' | 'transcribing' | 'processing'}
              mode={mode}
              speaking={recording && spoken < sample.said.length}
              target={target}
              onTarget={(t) => {
                takeOver()
                setTarget(t)
              }}
              onCancel={() => {
                takeOver()
                cancel()
              }}
              onConfirm={() => {
                takeOver()
                finish()
              }}
            />
          )}
        </div>
      </div>

      <div className="hd-controls">
        <button
          type="button"
          className={'hd-talk' + (recording ? ' live' : '')}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault()
              onDown()
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') onUp()
          }}
        >
          <span className="hd-fn">fn</span>
          {recording ? '松开或再点一下结束' : '按住说话 / 点一下开始'}
        </button>
        <div className="hd-opts">
          <div className="hd-seg" role="group" aria-label="模式">
            {(
              [
                ['dictate', '口述 · Fn'],
                ['translate', '翻译 · Fn+⇧'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                aria-pressed={mode === v}
                disabled={phase !== 'idle' && phase !== 'pasted'}
                onClick={() => {
                  takeOver()
                  setMode(v)
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="hd-seg" role="group" aria-label="口述整理" data-dim={mode === 'translate' || undefined}>
            {(
              [
                ['off', '不整理'],
                ['fix', '仅纠错'],
                ['polish', '整理'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                aria-pressed={cleanup === v}
                disabled={mode === 'translate' || (phase !== 'idle' && phase !== 'pasted')}
                onClick={() => {
                  takeOver()
                  setCleanup(v)
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="hd-note">
        {sample.dict && mode === 'dictate' ? (
          <>
            词典生效：「{sample.dict[0]}」→「{sample.dict[1]}」。
          </>
        ) : null}
        演示为脚本回放，不会使用你的麦克风。录音时按 Esc 取消。
      </p>
    </div>
  )
}
