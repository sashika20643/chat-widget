import { triggerThankYouNotification } from '@/utils/chatWidgetNotifications'

interface ThankYouTriggerAPI {
  trigger: () => void
}

declare global {
  interface Window {
    ChatWidgetThankYouTrigger?: ThankYouTriggerAPI
    /** Set before dispatch so ChatWidget can show UI if the event fired before listeners mounted. */
    __CHAT_WIDGET_PENDING_THANK_YOU__?: {
      ts: number
    }
  }
}

window.ChatWidgetThankYouTrigger = {
  trigger() {
    window.__CHAT_WIDGET_PENDING_THANK_YOU__ = { ts: Date.now() }
    // Defer so embed React root + ChatWidget listeners are ready.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerThankYouNotification()
      })
    })
  },
}

