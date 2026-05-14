import { triggerWebFormAbandonmentNotification } from '@/utils/chatWidgetNotifications'

interface WebFormAbandonmentTriggerAPI {
  trigger: (source?: 'back_button' | 'browser_back' | 'close_attempt' | 'unknown') => void
}

declare global {
  interface Window {
    ChatWidgetWebFormAbandonmentTrigger?: WebFormAbandonmentTriggerAPI
    /** Set before dispatch so ChatWidget can show UI if the event fired before listeners mounted. */
    __CHAT_WIDGET_PENDING_WEBFORM_ABANDON__?: {
      source?: 'back_button' | 'browser_back' | 'close_attempt' | 'unknown'
      ts: number
    }
  }
}

window.ChatWidgetWebFormAbandonmentTrigger = {
  trigger(source = 'unknown') {
    window.__CHAT_WIDGET_PENDING_WEBFORM_ABANDON__ = { source, ts: Date.now() }
    // Defer so embed React root + ChatWidget listeners are ready; also allows paint on back navigation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerWebFormAbandonmentNotification({ source })
      })
    })
  },
}

