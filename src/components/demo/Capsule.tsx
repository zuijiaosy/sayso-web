// The recording overlay, rebuilt from src/overlay/RecordingOverlay.tsx: ✕,
// waveform or a spinner with a status label, ✓, and the "翻译为" row above it
// in translation mode.
import { useEffect, useRef, useState } from 'react'

import { targetLabel, type Target } from './samples'

const WAVE_BARS = 11

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8.4 L6.6 11.3 L12.5 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const Chevrons = () => (
  <svg viewBox="0 0 12 16" aria-hidden="true">
    <path d="M3 6 L6 3 L9 6 M3 10 L6 13 L9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

/** Simulated mic levels: louder while `speaking`, a quiet floor otherwise. */
function useLevels(active: boolean, speaking: boolean) {
  const [levels, setLevels] = useState<number[]>(() => Array(WAVE_BARS).fill(0))
  const smooth = useRef<number[]>(Array(WAVE_BARS).fill(0))
  const speakingRef = useRef(speaking)
  speakingRef.current = speaking

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      const loud = speakingRef.current
      smooth.current = smooth.current.map((prev) => {
        const target = loud ? 0.25 + Math.random() * 0.75 : Math.random() * 0.12
        return prev * 0.55 + target * 0.45
      })
      setLevels([...smooth.current])
    }, 70)
    return () => window.clearInterval(id)
  }, [active])

  return levels
}

export type CapsuleState = 'recording' | 'transcribing' | 'processing'

export function Capsule({
  state,
  mode,
  speaking,
  target,
  onTarget,
  onCancel,
  onConfirm,
}: {
  state: CapsuleState
  mode: 'dictate' | 'translate'
  speaking: boolean
  target: Target
  onTarget: (t: Target) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const recording = state === 'recording'
  const levels = useLevels(recording, speaking)
  const [picker, setPicker] = useState(false)

  useEffect(() => {
    if (!recording) setPicker(false)
  }, [recording])

  const label = state === 'transcribing' ? '识别中…' : mode === 'translate' ? '翻译中…' : '整理中…'

  return (
    <div className="vl">
      {mode === 'translate' && (
        <div className="vl-translate">
          {picker && (
            <ul className="vl-picker" role="listbox">
              {(Object.keys(targetLabel) as Target[]).map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={code === target}
                    className={code === target ? 'selected' : ''}
                    onClick={() => {
                      onTarget(code)
                      setPicker(false)
                    }}
                  >
                    {targetLabel[code]}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="vl-translate-row">
            <span className="vl-translate-label">翻译为</span>
            <button type="button" className="vl-select" aria-haspopup="listbox" aria-expanded={picker} onClick={() => setPicker(!picker)}>
              <span>{targetLabel[target]}</span>
              <Chevrons />
            </button>
          </div>
        </div>
      )}
      <div className="vl-capsule">
        <button type="button" className="vl-icon-btn vl-cancel" aria-label="取消" onClick={onCancel}>
          <CloseIcon />
        </button>
        {recording ? (
          <div className="vl-wave" aria-hidden="true">
            {levels.map((v, i) => {
              const center = 1 - Math.abs(i - (WAVE_BARS - 1) / 2) / WAVE_BARS
              const h = 4 + Math.pow(v, 0.7) * 18 * (0.55 + center * 0.45)
              return <i key={i} style={{ height: `${Math.max(4, Math.min(22, h))}px` }} />
            })}
          </div>
        ) : (
          <div className="vl-work">
            <span className="vl-spinner" />
            <span className="vl-work-label">{label}</span>
          </div>
        )}
        <button type="button" className="vl-icon-btn vl-confirm" aria-label="完成" disabled={!recording} onClick={onConfirm}>
          <CheckIcon />
        </button>
      </div>
    </div>
  )
}
