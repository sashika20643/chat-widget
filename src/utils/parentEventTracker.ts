/**
 * Tracks parent website events (clicks, scrolls) and user inactivity
 */

export interface ParentEventCallbacks {
  onUserClick?: (event: MouseEvent) => void
  onUserScroll?: (event: Event) => void
  onUserInactive?: (inactiveDuration: number) => void // Duration in milliseconds
}

export class ParentEventTracker {
  private clickHandler: ((e: MouseEvent) => void) | null = null
  private scrollHandler: ((e: Event) => void) | null = null
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null
  private lastActivityTime: number = Date.now()
  private inactivityThreshold: number = 2 * 60 * 1000 // 2 minutes in milliseconds
  private callbacks: ParentEventCallbacks = {}
  private isTracking: boolean = false

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

    // Track clicks on parent document
    this.clickHandler = (e: MouseEvent) => {
      this.lastActivityTime = Date.now()
      this.resetInactivityTimer()
      
      // Ignore clicks inside the widget container
      const widgetContainer = document.getElementById('chatbot-widget-container')
      if (widgetContainer && widgetContainer.contains(e.target as Node)) {
        return
      }

      console.log('[ParentEventTracker] User click detected', e)
      if (this.callbacks.onUserClick) {
        this.callbacks.onUserClick(e)
      }
    }

    // Track scrolls on parent window
    this.scrollHandler = (e: Event) => {
      this.lastActivityTime = Date.now()
      this.resetInactivityTimer()

      console.log('[ParentEventTracker] User scroll detected', e)
      if (this.callbacks.onUserScroll) {
        this.callbacks.onUserScroll(e)
      }
    }

    // Add event listeners to parent window/document
    if (typeof window !== 'undefined') {
      window.addEventListener('click', this.clickHandler, true) // Use capture phase
      window.addEventListener('scroll', this.scrollHandler, true)
      
      // Also listen to document for better coverage
      document.addEventListener('click', this.clickHandler, true)
      document.addEventListener('scroll', this.scrollHandler, true)
    }

    // Start inactivity monitoring
    this.startInactivityTimer()

    console.log('[ParentEventTracker] Started tracking parent website events')
  }

  stopTracking() {
    if (!this.isTracking) {
      return
    }

    this.isTracking = false

    if (this.clickHandler && typeof window !== 'undefined') {
      window.removeEventListener('click', this.clickHandler, true)
      document.removeEventListener('click', this.clickHandler, true)
    }

    if (this.scrollHandler && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollHandler, true)
      document.removeEventListener('scroll', this.scrollHandler, true)
    }

    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer)
      this.inactivityTimer = null
    }

    console.log('[ParentEventTracker] Stopped tracking parent website events')
  }

  private startInactivityTimer() {
    // Check every 30 seconds for inactivity
    this.inactivityTimer = setInterval(() => {
      const now = Date.now()
      const inactiveDuration = now - this.lastActivityTime

      if (inactiveDuration >= this.inactivityThreshold) {
        console.log('[ParentEventTracker] User inactive for', Math.round(inactiveDuration / 1000), 'seconds')
        if (this.callbacks.onUserInactive) {
          this.callbacks.onUserInactive(inactiveDuration)
        }
      }
    }, 30000) // Check every 30 seconds
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
