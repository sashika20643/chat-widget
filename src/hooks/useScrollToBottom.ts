import { useEffect, type RefObject } from 'react'

/**
 * Scrolls the element (e.g. messages end anchor) into view when deps change.
 */
export function useScrollToBottom(
  ref: RefObject<HTMLElement | null>,
  deps: React.DependencyList
): void {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, deps)
}
