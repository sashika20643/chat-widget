import { useEffect, useRef } from 'react'
import {
  startProductDwellTimer,
  triggerProductDwellNotification,
} from '@/utils/chatWidgetNotifications'

const EXAMPLE_PRODUCT_NAME = 'Vintage Lounge Chair'

export function ProductDwellNotificationExample() {
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const stop = startProductDwellTimer(EXAMPLE_PRODUCT_NAME, 15_000)
    stopRef.current = stop
    return stop
  }, [])

  return (
    <div className="bg-card border rounded-lg p-6 space-y-3">
      <h3 className="text-lg font-semibold">Example Page B: Product Dwell Notification</h3>
      <p className="text-sm text-muted-foreground">
        Starts a 15-second timer for a product page and triggers the dedicated product dwell notification.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => triggerProductDwellNotification({ productName: EXAMPLE_PRODUCT_NAME, dwellMs: 0 })}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Trigger Product Dwell Now
        </button>
        <button
          type="button"
          onClick={() => {
            stopRef.current?.()
            stopRef.current = startProductDwellTimer(EXAMPLE_PRODUCT_NAME, 15_000)
          }}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Restart 15s Dwell Timer
        </button>
      </div>
    </div>
  )
}

