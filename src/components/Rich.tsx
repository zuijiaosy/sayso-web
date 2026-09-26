import type { ReactNode } from 'react'

// Tiny markup for content strings: [Fn] renders as a key, `path` as code,
// **text** as bold.
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] !== undefined) parts.push(<kbd key={m.index}>{m[1]}</kbd>)
    else if (m[2] !== undefined) parts.push(<code key={m.index}>{m[2]}</code>)
    else parts.push(<b key={m.index}>{m[3]}</b>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
