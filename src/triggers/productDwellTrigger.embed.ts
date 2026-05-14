import {
  startProductDwellTimer,
  triggerProductDwellNotification,
} from '@/utils/chatWidgetNotifications'

interface ProductDwellTriggerAPI {
  trigger: (productName: string, dwellMs?: number) => void
  start: (productName: string, dwellMs?: number) => () => void
}

declare global {
  interface Window {
    ChatWidgetProductDwellTrigger?: ProductDwellTriggerAPI
  }
}

window.ChatWidgetProductDwellTrigger = {
  trigger(productName: string, dwellMs?: number) {
    triggerProductDwellNotification({ productName, dwellMs })
  },
  start(productName: string, dwellMs?: number) {
    return startProductDwellTimer(productName, dwellMs)
  },
}

