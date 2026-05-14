import { triggerScrollIndecisionNotification } from '@/utils/chatWidgetNotifications'

interface ScrollIndecisionStartOptions {
  /** Minimum number of up scroll actions within the window. */
  minUp?: number
  /** Minimum number of down scroll actions within the window. */
  minDown?: number
  /** Detection window size in ms. */
  windowMs?: number
  /** Minimum wheel/touch delta to consider as a deliberate direction change. */
  minDeltaY?: number
  /** Minimum window scroll delta to register a direction on `scroll` events. */
  minScrollDeltaY?: number
}

interface ScrollIndecisionTriggerAPI {
  trigger: () => void
  start: (options?: ScrollIndecisionStartOptions) => () => void
}

declare global {
  interface Window {
    ChatWidgetScrollIndecisionTrigger?: ScrollIndecisionTriggerAPI
    /** Set before dispatch so ChatWidget can show UI if event fires too early. */
    __CHAT_WIDGET_PENDING_SCROLL_INDECISION__?: { ts: number }
  }
}

const DEFAULT_WINDOW_MS = 30_000
const DEFAULT_MIN_COUNT = 2
const DEFAULT_MIN_DELTA_Y = 40
const DEFAULT_MIN_SCROLL_DELTA_Y = 24

function getScrollY(): number {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    document.body.scrollTop ??
    0
  )
}

window.ChatWidgetScrollIndecisionTrigger = {
  trigger() {
    window.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__ = { ts: Date.now() }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerScrollIndecisionNotification()
      })
    })
  },
  start(options = {}) {
    const minUp = options.minUp ?? DEFAULT_MIN_COUNT
    const minDown = options.minDown ?? DEFAULT_MIN_COUNT
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
    const minDeltaY = options.minDeltaY ?? DEFAULT_MIN_DELTA_Y
    const minScrollDeltaY = options.minScrollDeltaY ?? DEFAULT_MIN_SCROLL_DELTA_Y

    type Direction = 'up' | 'down'
    const recent: Array<{ dir: Direction; ts: number }> = []
    let triggered = false
    let lastScrollY = getScrollY()
    let lastDirection: Direction | null = null
    let directionChanges = 0

    const push = (dir: Direction) => {
      const now = Date.now()
      recent.push({ dir, ts: now })
      while (recent.length && now - recent[0].ts > windowMs) recent.shift()
      const upCount = recent.filter((e) => e.dir === 'up').length
      const downCount = recent.filter((e) => e.dir === 'down').length
      if (lastDirection && lastDirection !== dir) {
        directionChanges += 1
      }
      lastDirection = dir

      // Fire when both direction counts are met OR user changed direction multiple times.
      const meetsCountRule = upCount >= minUp && downCount >= minDown
      const meetsBackAndForthRule = directionChanges >= 2

      if (!triggered && (meetsCountRule || meetsBackAndForthRule)) {
        triggered = true
        window.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__ = { ts: now }
        triggerScrollIndecisionNotification({ upCount, downCount })
      }
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < minDeltaY) return
      push(event.deltaY > 0 ? 'down' : 'up')
    }

    const onScroll = () => {
      const currentY = getScrollY()
      const deltaY = currentY - lastScrollY
      lastScrollY = currentY
      if (Math.abs(deltaY) < minScrollDeltaY) return
      push(deltaY > 0 ? 'down' : 'up')
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
    }
  },
}

