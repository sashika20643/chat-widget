import { useRef, useEffect } from 'react'

const DEFAULT_MIN_PX = 44
const DEFAULT_MAX_RATIO = 0.4

export interface UseAutoResizeTextareaOptions {
  minHeightPx?: number
  maxHeightRatio?: number
}

/**
 * Adjusts textarea height to content, capped by min/max. Call with value so it runs when content changes.
 */
export function useAutoResizeTextarea(
  value: string,
  options: UseAutoResizeTextareaOptions = {}
): React.RefObject<HTMLTextAreaElement | null> {
  const ref = useRef<HTMLTextAreaElement>(null)
  const minPx = options.minHeightPx ?? DEFAULT_MIN_PX
  const maxRatio = options.maxHeightRatio ?? DEFAULT_MAX_RATIO

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const maxPx = window.innerHeight * maxRatio
    el.style.height = '0'
    const contentHeight = el.scrollHeight
    el.style.height = `${Math.min(Math.max(contentHeight, minPx), maxPx)}px`
  }, [value, minPx, maxRatio])

  useEffect(() => {
    const win = typeof window === 'undefined' ? null : window
    if (!win) return
    const adjust = () => {
      const el = ref.current
      if (!el) return
      const maxPx = win.innerHeight * maxRatio
      el.style.height = '0'
      const contentHeight = el.scrollHeight
      el.style.height = `${Math.min(Math.max(contentHeight, minPx), maxPx)}px`
    }
    win.addEventListener('resize', adjust)
    return () => win.removeEventListener('resize', adjust)
  }, [minPx, maxRatio])

  return ref
}
