// Picks the installer for the visitor's OS after hydration; the prerendered
// HTML defaults to macOS, the fork's primary platform.
import { useEffect, useState } from 'react'

export type OS = 'mac' | 'win'

export function useOS(): OS {
  const [os, setOs] = useState<OS>('mac')
  useEffect(() => {
    if (/Windows/i.test(navigator.userAgent)) setOs('win')
  }, [])
  return os
}
