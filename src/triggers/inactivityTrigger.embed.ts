import { triggerInactivityNotification } from '@/utils/chatWidgetNotifications'

interface InactivityTriggerAPI {
  trigger: () => void
  start: (idleMs?: number) => () => void
}

declare global {
  interface Window {
    ChatWidgetInactivityTrigger?: InactivityTriggerAPI
    /** Set before dispatch so ChatWidget can show UI if event fires too early. */
    __CHAT_WIDGET_PENDING_INACTIVITY__?: { ts: number }
  }
}

window.ChatWidgetInactivityTrigger = {
  trigger() {
    window.__CHAT_WIDGET_PENDING_INACTIVITY__ = { ts: Date.now() }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerInactivityNotification()
      })
    })
  },
  start(idleMs = 60_000) {
    let timeoutId: number | null = null

    const arm = () => {
      if (timeoutId != null) window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        window.__CHAT_WIDGET_PENDING_INACTIVITY__ = { ts: Date.now() }
        triggerInactivityNotification()
      }, idleMs)
    }

    const onActivity = () => {
      arm()
    }

    const events: Array<keyof WindowEventMap> = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove']
    for (const eventName of events) {
      window.addEventListener(eventName, onActivity, { passive: true })
    }

    arm()

    return () => {
      if (timeoutId != null) window.clearTimeout(timeoutId)
      for (const eventName of events) {
        window.removeEventListener(eventName, onActivity)
      }
    }
  },
}

