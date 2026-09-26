// Adds `.in` to every `.reveal` element as it scrolls into view. One observer
// for the whole page; elements rendered later are picked up by the mutation
// observer.
import { useEffect } from 'react'

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

/** Splits a headline into words that rise one after another. */
export function Rise({ text, className }: { text: string; className?: string }) {
  return (
    <span className={'rise ' + (className ?? '')}>
      {Array.from(text).map((ch, i) => (
        <span key={i} style={{ ['--i' as string]: i }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}
