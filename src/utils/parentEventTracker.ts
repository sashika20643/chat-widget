/**
 * Tracks parent (main site) website events (clicks, scrolls, keydown) and user inactivity.
 * All main-site events are console-logged. When user is inactive for the threshold, notification is triggered.
 * When the widget runs inside an iframe, listens to the parent (top) window so main-site clicks are detected.
 */

export interface ParentEventCallbacks {
  onUserClick?: (event: MouseEvent) => void
  onUserScroll?: (event: Event) => void
  onUserKeydown?: (event: KeyboardEvent) => void
  onUserInactive?: (inactiveDuration: number) => void // Duration in milliseconds
}

/** Returns the document we consider "main site" – current doc if same page, parent doc if we're in an iframe */
function getMainSiteDocument(): Document {
  if (typeof window === 'undefined') return document
  try {
    if (window.self !== window.top && window.top?.document) {
      return window.top.document
    }
  } catch {
    // Cross-origin iframe: cannot access parent
  }
  return document
}

/** Returns the window we consider "main site" */
function getMainSiteWindow(): Window {
  if (typeof window === 'undefined') return window
  try {
    if (window.self !== window.top && window.top) {
      return window.top
    }
  } catch {
    // Cross-origin iframe
  }
  return window
}

function isInsideWidget(target: EventTarget | null, doc: Document): boolean {
  const widgetContainer = doc.getElementById('chatbot-widget-container')
  if (!widgetContainer || !target) return false
  try {
    return widgetContainer.contains(target as Node)
  } catch {
    return false
  }
}

function logMainSiteEvent(type: string, detail: Record<string, unknown>) {
  console.log('[ParentEventTracker] Main site event:', type, {
    ...detail,
    timestamp: new Date().toISOString(),
  })
}

export class ParentEventTracker {
  private clickHandler: ((e: MouseEvent) => void) | null = null
  private scrollHandler: ((e: Event) => void) | null = null
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null
  private lastActivityTime: number = Date.now()
  private inactivityThreshold: number = 2 * 60 * 1000 // 2 minutes in milliseconds
  private hasFiredInactivityForCurrentPeriod: boolean = false
  private callbacks: ParentEventCallbacks = {}
  private isTracking: boolean = false
  private mainDoc: Document = document
  private mainWin: Window = typeof window !== 'undefined' ? window : ({} as Window)

  constructor(callbacks: ParentEventCallbacks = {}) {
    this.callbacks = callbacks
  }

  startTracking() {
    if (this.isTracking) {
      console.log('[ParentEventTracker] Already tracking events')
      return
    }

    this.isTracking = true
    this.lastActivityTime = Date.now()
    this.hasFiredInactivityForCurrentPeriod = false
    this.mainDoc = getMainSiteDocument()
    this.mainWin = getMainSiteWindow()

    const inIframe = typeof window !== 'undefined' && window.self !== window.top
    console.log('[ParentEventTracker] Start tracking. In iframe:', inIframe, 'Listening on:', inIframe ? 'parent document' : 'current document')

    // Track clicks on main site (ignore widget)
    this.clickHandler = (e: MouseEvent) => {
      const target = e.target as Node
      const inside = isInsideWidget(e.target, this.mainDoc)
      if (inside) return

      this.lastActivityTime = Date.now()
      this.hasFiredInactivityForCurrentPeriod = false
      this.resetInactivityTimer()

      const el = target as HTMLElement
      logMainSiteEvent('click', {
        target: el?.tagName,
        id: el?.id || undefined,
        className: typeof el?.className === 'string' ? el.className.slice(0, 80) : undefined,
        clientX: e.clientX,
        clientY: e.clientY,
      })
      if (this.callbacks.onUserClick) {
        this.callbacks.onUserClick(e)
      }
    }

    // Track scrolls on main site
    this.scrollHandler = (e: Event) => {
      if (isInsideWidget(e.target, this.mainDoc)) return

      this.lastActivityTime = Date.now()
      this.hasFiredInactivityForCurrentPeriod = false
      this.resetInactivityTimer()

      const target = e.target as Window | HTMLElement
      const scrollY = target === this.mainWin ? (this.mainWin as Window).scrollY : (target as HTMLElement)?.scrollTop
      const scrollX = target === this.mainWin ? (this.mainWin as Window).scrollX : (target as HTMLElement)?.scrollLeft
      logMainSiteEvent('scroll', {
        target: target === this.mainWin ? 'window' : (target as HTMLElement)?.tagName,
        scrollY,
        scrollX,
      })
      if (this.callbacks.onUserScroll) {
        this.callbacks.onUserScroll(e)
      }
    }

    // Track keydown on main site
    this.keydownHandler = (e: KeyboardEvent) => {
      if (isInsideWidget(e.target, this.mainDoc)) return

      this.lastActivityTime = Date.now()
      this.hasFiredInactivityForCurrentPeriod = false
      this.resetInactivityTimer()

      const el = e.target as HTMLElement
      logMainSiteEvent('keydown', {
        key: e.key,
        target: el?.tagName,
        id: el?.id || undefined,
      })
      if (this.callbacks.onUserKeydown) {
        this.callbacks.onUserKeydown(e)
      }
    }

    // Attach to main-site document/window (parent when in iframe, so main-site clicks are seen)
    if (typeof window !== 'undefined') {
      this.mainWin.addEventListener('click', this.clickHandler, true)
      this.mainWin.addEventListener('scroll', this.scrollHandler, true)
      this.mainDoc.addEventListener('keydown', this.keydownHandler, true)
      this.mainDoc.addEventListener('click', this.clickHandler, true)
      this.mainDoc.addEventListener('scroll', this.scrollHandler, true)
    }

    this.startInactivityTimer()
    console.log('[ParentEventTracker] Listening for main site events (click, scroll, keydown). Inactivity threshold:', this.inactivityThreshold / 60000, 'min')
  }

  stopTracking() {
    if (!this.isTracking) {
      return
    }

    this.isTracking = false

    if (typeof window !== 'undefined' && this.mainWin && this.mainDoc) {
      if (this.clickHandler) {
        this.mainWin.removeEventListener('click', this.clickHandler, true)
        this.mainDoc.removeEventListener('click', this.clickHandler, true)
      }
      if (this.scrollHandler) {
        this.mainWin.removeEventListener('scroll', this.scrollHandler, true)
        this.mainDoc.removeEventListener('scroll', this.scrollHandler, true)
      }
      if (this.keydownHandler) {
        this.mainDoc.removeEventListener('keydown', this.keydownHandler, true)
      }
    }

    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer)
      this.inactivityTimer = null
    }

    console.log('[ParentEventTracker] Stopped tracking main site events')
  }

  private startInactivityTimer() {
    // Check every 15 seconds so we fire close to the threshold (e.g. 1 min)
    this.inactivityTimer = setInterval(() => {
      const now = Date.now()
      const inactiveDuration = now - this.lastActivityTime

      if (
        inactiveDuration >= this.inactivityThreshold &&
        !this.hasFiredInactivityForCurrentPeriod
      ) {
        this.hasFiredInactivityForCurrentPeriod = true
        const seconds = Math.round(inactiveDuration / 1000)
        logMainSiteEvent('inactivity', {
          inactiveSeconds: seconds,
          thresholdMinutes: this.inactivityThreshold / 60000,
          lastActivityTime: new Date(this.lastActivityTime).toISOString(),
        })
        console.log('[ParentEventTracker] Main site inactive for', seconds, 's — firing notification')
        if (this.callbacks.onUserInactive) {
          this.callbacks.onUserInactive(inactiveDuration)
        }
      }
    }, 15000) // Check every 15 seconds
  }

  private resetInactivityTimer() {
    // Timer is already checking periodically, just update lastActivityTime
    // The timer will detect the inactivity on its next check
  }

  updateCallbacks(callbacks: Partial<ParentEventCallbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  setInactivityThreshold(minutes: number) {
    this.inactivityThreshold = minutes * 60 * 1000
  }

  getLastActivityTime(): number {
    return this.lastActivityTime
  }

  getInactiveDuration(): number {
    return Date.now() - this.lastActivityTime
  }
}
